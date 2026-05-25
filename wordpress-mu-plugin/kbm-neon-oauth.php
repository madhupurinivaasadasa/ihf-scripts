<?php
/**
 * Plugin Name: KBM Neon Donor OAuth Complete
 * Description: Server-side Neon constituent OAuth code exchange + API v2 employer lookup for donate pages (ihf-scripts donor-login-bar.js).
 * Version: 1.0.0
 *
 * Install: copy this file to wp-content/mu-plugins/kbm-neon-oauth.php
 * Secrets: add to wp-config.php (never commit real values):
 *
 *   define('NEON_OAUTH_CLIENT_ID', 'wqAItUW7cuiGpj5NaiO8bevHTz_HxIp52qUZ_X6tphzEMmgZQFcmD9A3rpUXe99v');
 *   define('NEON_OAUTH_CLIENT_SECRET', '...'); // Neon → Settings → OAuth Configuration
 *   define('NEON_API_AUTHORIZATION', 'Basic ...'); // API v2 org key (same as crm_python)
 *   define('NEON_API_VERSION', '2.11'); // optional
 *
 * Public URL (matches donor-login-bar.js default from data-redirect):
 *   POST https://www.kbgoshala.org/api/neon/oauth/complete
 *
 * Fallback REST URL (if permalinks/rewrite fail):
 *   POST https://www.kbgoshala.org/wp-json/kbm/v1/neon/oauth/complete
 *   → set data-oauth-complete-url on #kbmLoginBar to that URL.
 *
 * @see https://developer.neoncrm.com/authenticating-constituents/
 * @see https://developer.neoncrm.com/accounts/
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Registered Neon OAuth redirect URIs (path must be /donate). */
function kbm_neon_allowed_redirect_hosts() {
    return apply_filters('kbm_neon_allowed_redirect_hosts', array(
        'www.kbgoshala.org',
        'kbgoshala.org',
        'www.kbmandir.org',
        'kbmandir.org',
    ));
}

function kbm_neon_get_config($key, $default = '') {
    if (defined($key)) {
        return constant($key);
    }
    return $default;
}

function kbm_neon_is_redirect_uri_allowed($redirect_uri) {
    $parts = wp_parse_url($redirect_uri);
    if (empty($parts['scheme']) || empty($parts['host'])) {
        return false;
    }
    if (!in_array(strtolower($parts['scheme']), array('https', 'http'), true)) {
        return false;
    }
    $host = strtolower($parts['host']);
    if (!in_array($host, kbm_neon_allowed_redirect_hosts(), true)) {
        return false;
    }
    $path = isset($parts['path']) ? untrailingslashit($parts['path']) : '';
    return $path === '/donate';
}

function kbm_neon_cors_origin_allowed($origin) {
    if (!$origin) {
        return false;
    }
    $parts = wp_parse_url($origin);
    if (empty($parts['host'])) {
        return false;
    }
    return in_array(strtolower($parts['host']), kbm_neon_allowed_redirect_hosts(), true);
}

function kbm_neon_send_cors_headers() {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_ORIGIN'])) : '';
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    if (kbm_neon_cors_origin_allowed($origin)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
}

function kbm_neon_json_response($data, $status = 200) {
    kbm_neon_send_cors_headers();
    status_header($status);
    header('Content-Type: application/json; charset=utf-8');
    echo wp_json_encode($data);
}

function kbm_neon_exchange_code_for_account_id($code, $redirect_uri) {
    $client_id = kbm_neon_get_config('NEON_OAUTH_CLIENT_ID', 'wqAItUW7cuiGpj5NaiO8bevHTz_HxIp52qUZ_X6tphzEMmgZQFcmD9A3rpUXe99v');
    $client_secret = kbm_neon_get_config('NEON_OAUTH_CLIENT_SECRET', '');

    if ($client_secret === '') {
        return new WP_Error('oauth_not_configured', 'NEON_OAUTH_CLIENT_SECRET is not configured', array('status' => 503));
    }

    $response = wp_remote_post(
        'https://app.neoncrm.com/np/oauth/token',
        array(
            'timeout' => 20,
            'headers' => array(
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Accept'       => 'application/json',
            ),
            'body'    => array(
                'client_id'     => $client_id,
                'client_secret' => $client_secret,
                'redirect_uri'  => $redirect_uri,
                'code'          => $code,
                'grant_type'    => 'authorization_code',
            ),
        )
    );

    if (is_wp_error($response)) {
        return new WP_Error('oauth_token_request_failed', $response->get_error_message(), array('status' => 502));
    }

    $status = wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    if ($status < 200 || $status >= 300) {
        $detail = '';
        if (is_array($body)) {
            $detail = isset($body['error_description']) ? $body['error_description'] : (isset($body['error']) ? $body['error'] : '');
        }
        return new WP_Error(
            'oauth_token_exchange_failed',
            'Neon token exchange failed (' . $status . '): ' . $detail,
            array('status' => 502)
        );
    }

    $account_id = isset($body['access_token']) ? trim((string) $body['access_token']) : '';
    if ($account_id === '') {
        return new WP_Error('oauth_missing_access_token', 'Neon token exchange returned no access_token', array('status' => 502));
    }

    return $account_id;
}

/**
 * API v2: GET /accounts/{id} → individualAccount.company.name
 */
function kbm_neon_fetch_employer_for_account($account_id) {
    $authorization = kbm_neon_get_config('NEON_API_AUTHORIZATION', '');
    if ($authorization === '') {
        return null;
    }

    if (stripos($authorization, 'Basic ') !== 0) {
        $authorization = 'Basic ' . $authorization;
    }

    $api_version = kbm_neon_get_config('NEON_API_VERSION', '2.11');
    $url = 'https://api.neoncrm.com/v2/accounts/' . rawurlencode($account_id);

    $response = wp_remote_get(
        $url,
        array(
            'timeout' => 20,
            'headers' => array(
                'Accept'           => '*/*',
                'Content-Type'     => 'application/json',
                'Authorization'    => $authorization,
                'NEON-API-VERSION' => $api_version,
            ),
        )
    );

    if (is_wp_error($response)) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[kbm-neon-oauth] account lookup failed: ' . $response->get_error_message());
        }
        return null;
    }

    $status = wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    if ($status < 200 || $status >= 300) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('[kbm-neon-oauth] account lookup HTTP ' . $status);
        }
        return null;
    }

    if (!is_array($body) || empty($body['individualAccount']['company']['name'])) {
        return null;
    }

    $name = trim((string) $body['individualAccount']['company']['name']);
    return $name !== '' ? $name : null;
}

function kbm_neon_handle_oauth_complete() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        kbm_neon_send_cors_headers();
        status_header(204);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        kbm_neon_json_response(array('error' => 'method_not_allowed'), 405);
        exit;
    }

    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    if (!is_array($payload)) {
        kbm_neon_json_response(array('error' => 'invalid_json'), 400);
        exit;
    }

    $code = isset($payload['code']) ? trim((string) $payload['code']) : '';
    $redirect_uri = isset($payload['redirectUri']) ? trim((string) $payload['redirectUri']) : '';

    if ($code === '' || $redirect_uri === '') {
        kbm_neon_json_response(array('error' => 'missing_code_or_redirect_uri'), 400);
        exit;
    }

    if (!kbm_neon_is_redirect_uri_allowed($redirect_uri)) {
        kbm_neon_json_response(array('error' => 'invalid_redirect_uri'), 400);
        exit;
    }

    $account_result = kbm_neon_exchange_code_for_account_id($code, $redirect_uri);
    if (is_wp_error($account_result)) {
        $data = array('error' => $account_result->get_error_code());
        if ($account_result->get_error_message()) {
            $data['message'] = $account_result->get_error_message();
        }
        kbm_neon_json_response($data, (int) $account_result->get_error_data()['status']);
        exit;
    }

    $employer = kbm_neon_fetch_employer_for_account($account_result);

    kbm_neon_json_response(
        array(
            'accountId' => $account_result,
            'employer'  => $employer,
        ),
        200
    );
    exit;
}

/** Pretty URL: /api/neon/oauth/complete (used by ihf-scripts donor-login-bar.js). */
function kbm_neon_register_rewrites() {
    add_rewrite_rule('^api/neon/oauth/complete/?$', 'index.php?kbm_neon_oauth_complete=1', 'top');
}

function kbm_neon_query_vars($vars) {
    $vars[] = 'kbm_neon_oauth_complete';
    return $vars;
}

function kbm_neon_template_redirect() {
    if ((int) get_query_var('kbm_neon_oauth_complete') === 1) {
        kbm_neon_handle_oauth_complete();
    }
}

function kbm_neon_maybe_flush_rewrites() {
    if (get_option('kbm_neon_oauth_rewrite_version') !== '1') {
        flush_rewrite_rules(false);
        update_option('kbm_neon_oauth_rewrite_version', '1');
    }
}

/** REST fallback: /wp-json/kbm/v1/neon/oauth/complete */
function kbm_neon_register_rest_route() {
    register_rest_route(
        'kbm/v1',
        '/neon/oauth/complete',
        array(
            'methods'             => array('POST', 'OPTIONS'),
            'callback'            => 'kbm_neon_rest_oauth_complete',
            'permission_callback' => '__return_true',
        )
    );
}

function kbm_neon_rest_oauth_complete(WP_REST_Request $request) {
    if ($request->get_method() === 'OPTIONS') {
        $response = new WP_REST_Response(null, 204);
        $origin = $request->get_header('origin');
        if (kbm_neon_cors_origin_allowed($origin)) {
            $response->header('Access-Control-Allow-Origin', $origin);
            $response->header('Vary', 'Origin');
        }
        $response->header('Access-Control-Allow-Methods', 'POST, OPTIONS');
        $response->header('Access-Control-Allow-Headers', 'Content-Type');
        return $response;
    }

    $body = $request->get_json_params();
    if (!is_array($body)) {
        $body = array();
    }
    $code = isset($body['code']) ? trim((string) $body['code']) : '';
    $redirect_uri = isset($body['redirectUri']) ? trim((string) $body['redirectUri']) : '';

    if ($code === '' || $redirect_uri === '') {
        return new WP_REST_Response(array('error' => 'missing_code_or_redirect_uri'), 400);
    }

    if (!kbm_neon_is_redirect_uri_allowed($redirect_uri)) {
        return new WP_REST_Response(array('error' => 'invalid_redirect_uri'), 400);
    }

    $account_result = kbm_neon_exchange_code_for_account_id($code, $redirect_uri);
    if (is_wp_error($account_result)) {
        return new WP_REST_Response(
            array(
                'error'   => $account_result->get_error_code(),
                'message' => $account_result->get_error_message(),
            ),
            (int) $account_result->get_error_data()['status']
        );
    }

    $employer = kbm_neon_fetch_employer_for_account($account_result);

    $response = new WP_REST_Response(
        array(
            'accountId' => $account_result,
            'employer'  => $employer,
        ),
        200
    );
    $origin = $request->get_header('origin');
    if (kbm_neon_cors_origin_allowed($origin)) {
        $response->header('Access-Control-Allow-Origin', $origin);
        $response->header('Vary', 'Origin');
    }

    return $response;
}

add_action('init', 'kbm_neon_register_rewrites');
add_filter('query_vars', 'kbm_neon_query_vars');
add_action('template_redirect', 'kbm_neon_template_redirect');
add_action('init', 'kbm_neon_maybe_flush_rewrites', 20);
add_action('rest_api_init', 'kbm_neon_register_rest_route');
