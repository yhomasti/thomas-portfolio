//Script.js file


function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}


document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-image");
    const modalCaption = document.getElementById("modal-caption");
    const closeBtn = document.querySelector(".close-btn");
    const track = document.querySelector(".gallery-track");
  
    //modals open on click
    document.querySelectorAll(".gallery-track img").forEach((img) => {
      img.addEventListener("click", () => {
        modal.classList.remove("hidden");
        modalImg.src = img.src;
        modalCaption.textContent = img.alt;
      });
    });
  
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  
    let isDown = false;
    let startX;
    let scrollLeft;
  
    track.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.classList.add("active");
    });
  
    track.addEventListener("mouseleave", () => {
      isDown = false;
      track.classList.remove("active");
    });
  
    track.addEventListener("mouseup", () => {
      isDown = false;
      track.classList.remove("active");
    });
  
    track.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });
  
    //auto-scrolling the carousel
    setInterval(() => {
        if (!track) return;
        const maxScroll = track.scrollWidth - track.clientWidth;
        const firstImage = track.querySelector("img");
        const imageWidth = firstImage ? firstImage.offsetWidth + 16 : 0; 
      
        if (track.scrollLeft + imageWidth >= maxScroll - 1) {
          track.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          track.scrollBy({ left: imageWidth, behavior: "smooth" });
        }
      }, 6000);
  });
  