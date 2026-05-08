// Cookie Tracker Logic
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookieData() {
    let uName = getCookie("userName");
    let uLoc = getCookie("userLocation");
    const greeting = document.getElementById("cookie-greeting");
    const form = document.getElementById("cookie-form");
    const clearBtn = document.getElementById("clear-cookie-btn");
    
    if (!greeting) return;

    if (uName != "" && uLoc != "") {
        greeting.innerText = "Welcome back, " + uName + "! We see your stored location is: " + uLoc + ".";
        form.style.display = "none";
        clearBtn.style.display = "inline-block";
    } else {
        greeting.innerText = "No cookies found. Identify yourself!";
        form.style.display = "block";
        clearBtn.style.display = "none";
    }
}

function saveCookieData() {
    let name = document.getElementById("cookie-name").value;
    let loc = document.getElementById("cookie-location").value;
    if(name && loc) {
        setCookie("userName", name, 30);
        setCookie("userLocation", loc, 30);
        checkCookieData();
    } else {
        alert("Please fill out both Name and Location to save a cookie.");
    }
}

function clearCookies() {
    document.cookie = "userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userLocation=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    checkCookieData();
}

function autoDetectLocation() {
    const locInput = document.getElementById("cookie-location");
    locInput.value = "Detecting...";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
            .then(r => r.json())
            .then(data => {
                let city = data.address.city || data.address.town || data.address.state || "Unknown";
                locInput.value = city;
            }).catch(e => {
                locInput.value = "Lat: " + position.coords.latitude.toFixed(2) + ", Lon: " + position.coords.longitude.toFixed(2);
            });
        }, error => {
            alert("Location access denied or unavailable.");
            locInput.value = "";
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
  // Smart Auto-Hiding Navbar
  let lastScrollY = window.scrollY;
  const navBar = document.querySelector("nav");
  
  window.addEventListener("scroll", () => {
      if (window.scrollY > lastScrollY && window.scrollY > 150) {
          // Scrolling down
          navBar.style.transform = "translateY(-150%)";
      } else {
          // Scrolling up
          navBar.style.transform = "translateY(0)";
      }
      lastScrollY = window.scrollY;
  });

  // Initialize Cookie Tracker UI
  checkCookieData();

  const elements = document.querySelectorAll(".scroll-animate");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        } else {
          entry.target.classList.remove("active");
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  elements.forEach(el => observer.observe(el));
});