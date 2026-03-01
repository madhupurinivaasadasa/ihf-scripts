window.addEventListener("message", function(e) {
    if (e.data && e.data.type === "donationPageHeight") {
        var frame = document.getElementById("donationFrame");
        if (frame) frame.style.height = e.data.height + "px";
    }
});
