const text = `Hi, I'm Suraj Gurung.

AI & Machine Learning Enthusiast.

B.Tech Computer Science Student.

I build intelligent software,
web applications,
and real-world AI projects.

Welcome to my portfolio.`;

const speed = 45;

let i = 0;

function typeWriter(){

    if(i < text.length){

        document.getElementById("typewriter-text").innerHTML +=
        text.charAt(i);

        i++;

        setTimeout(typeWriter,speed);

    }

}

window.onload = typeWriter;