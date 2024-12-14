// helper functions
function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function move(image, x, y) {
    image.style.left = x + "px";
    image.style.top = y + "px";
}

function getDimensions(image) {
    // get the dimensions from the width and height attributes
    let width = image.getAttribute("width");
    let height = image.getAttribute("height");

    if (width != null && height != null) {
        return [parseInt(width), parseInt(height)];
    }

    // get the dimensions from the viewbox if the width and height are not set
    let viewbox = image.getAttribute("viewBox");

    if (viewbox == null) {
        return [300, 150]; // default dimensions for SVG
    }

    viewbox = viewbox.split(" ");

    width = parseInt(viewbox[2]);
    height = parseInt(viewbox[3]);

    return [width, height];
}

function changeDirection(index, value) {
    direction[index] = value;

    // check if color randomization is enabled and if the direction changed
    if (randomizeColor) {
        logo.style.fill = `rgb(${randint(0, 255)}, ${randint(0, 255)}, ${randint(0, 255)})`;
    }
}

function loadLocalSVG() {
    const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="263" height="117" opacity="0.65"><g fill="#231f20" fill-rule="evenodd" clip-rule="evenodd" style="fill:#fff"><path d="M165.893 105.636c2.293 6.195 2.595 7.697 2.595 12.906 0 12.38-9.101 23.499-25.287 30.892-12.006 5.484-22.924 7.548-39.914 7.548H74.904l10.634-45.901h25.046l-7.46 31.536h6.744c19.951 0 32.994-8.427 32.994-21.318 0-10.138-9.065-15.663-25.696-15.663H86.743l3.336-14.272h97.062l13.554 42.262 34.13-42.262h57.902c13.127 0 26.473 4.917 33.408 12.311 3.987 4.251 5.772 8.848 5.772 14.867 0 12.417-9.076 23.5-25.298 30.893-12.027 5.482-22.944 7.547-39.904 7.547h-28.382l10.611-45.901h25.07l-7.461 31.536h6.72c8.709 0 15.791-1.195 20.189-3.404 7.862-3.95 12.473-10.187 12.827-17.357.511-10.317-8.848-16.219-25.719-16.219h-31.534l-57.741 65.688-23.679-65.688zM285.149 179.418c-32.262-5.295-85.217-7.175-136.448-4.845-24.932 1.134-47.611 3.902-65.208 7.958-11.236 2.591-15.401 4.911-15.401 8.58 0 4.791 8.39 7.921 31.423 11.726 31.925 5.273 85.05 7.145 136.455 4.81 25.97-1.181 45.512-3.572 65.208-7.981 11.263-2.521 15.392-4.816 15.392-8.554-.001-4.808-8.317-7.904-31.421-11.694m-150.792 21.1H131.6l-12.257-18.652h6.488l6.812 10.706 6.094-10.706h6.649zm28.78.001h-5.91v-18.652h5.91zm23.447-.001h-8.689v-18.652h8.596c6.884 0 12.582 4.188 12.582 9.246 0 5.566-5.097 9.406-12.489 9.406m40.617 0h-14.435v-18.652h14.203v3.337h-8.271v3.963h7.784v3.336h-7.784v4.704h8.502v3.312zm26.278.254c-7.755 0-13.695-4.152-13.695-9.569 0-5.434 5.917-9.569 13.695-9.569 8.131 0 13.785 3.925 13.785 9.569 0 5.639-5.663 9.569-13.785 9.569" style="fill:#fff" transform="matrix(.99691 0 0 .99767 -67.882 -91.151)"/><path d="M183.248 197.205v-12.003h2.433c4.333 0 7.5 2.293 7.716 5.585.254 3.866-2.971 6.418-8.11 6.418zM261.029 191.042c0 3.659-3.066 6.163-7.551 6.163-4.297 0-7.572-2.741-7.37-6.163.214-3.603 3.133-5.84 7.623-5.84 3.956 0 7.298 2.676 7.298 5.84" style="fill:#fff" transform="matrix(.99691 0 0 .99767 -67.882 -91.151)"/></g></svg>
    `;

    const parser = new DOMParser();
    let image = parser.parseFromString(svgString, "image/svg+xml").documentElement;

    for (const attribute of ["fill", "style"]) {
        for (const element of image.querySelectorAll(`[${attribute}]`)) {
            element.removeAttribute(attribute);
        }
    }

    logo = image;
    dimensions = getDimensions(logo);

    logo.id = "logo";
    logo.style.fill = initialColor;

    document.body.append(logo);

    move(logo, x, y);
}

const initialColor = "white";
let randomizeColor = true;
const speed = 1.0;

// Variables
let x = randint(1, window.innerWidth - 1);
let y = randint(1, window.innerHeight - 1);
let direction = [1, 1];
let logo, dimensions;

loadLocalSVG();

// Main loop
setInterval(() => {
    if (!logo) return;

    x += speed * direction[0];
    y += speed * direction[1];

    if (x <= 1) {
        changeDirection(0, 1);
    } else if (x + dimensions[0] + 1 >= window.innerWidth) {
        changeDirection(0, -1);
    }

    if (y <= 1) {
        changeDirection(1, 1);
    } else if (y + dimensions[1] + 1 >= window.innerHeight) {
        changeDirection(1, -1);
    }

    move(logo, x, y);
}, 1000 / 60); // 60 FPS