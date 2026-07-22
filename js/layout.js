async function loadComponent(id, file) {

    const response = await fetch(file);

    const html = await response.text();

    document.getElementById(id).innerHTML = html;

}

async function loadLayout(){

    await loadComponent("navbar-container","../components/navbar.html");

    await loadComponent("sidebar-container","../components/sidebar.html");

}

loadLayout();