//Truco: con 'control + f' cambio puedo reemplazar unas palabras por otras

//Creamos las tarjetas
const cards = document.getElementById('cards');
const items = document.getElementById('items'); 
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
const fragment = document.createDocumentFragment();
let carrito = {}

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    if(localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    } // esto se hace para que los elementos se guarden aunque refresquemos el navegador
});

const fetchData = async () => {
    try {
        const res = await fetch('api.json');
        const data = await res.json(); //Poner siempre los parentesis
        pintarCards(data);
    } catch (error) {
        console.log(error)
    }
}

const pintarCards = data => {
    data.forEach(item => {
        templateCard.querySelector('h5').textContent = item.title;
        templateCard.querySelector('p').textContent = item.precio;
        templateCard.querySelector('.card-img-top').setAttribute("src", item.thumbnailUrl);
        templateCard.querySelector('button').dataset.id = item.id; 
    
        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone)
    })
    cards.appendChild(fragment)
}

//A continuacion detectamos el boton de "comprar"

//primero, hacemos que el contenedor 'cards' detecte el click, y con la funcion hago que capture los elementos

cards.addEventListener('click', e => {
    addCarrito(e);
})

const addCarrito =  e => {
    if(e.target.classList.contains('btn-dark')) {
        console.log(`e.target.parentElement (setCarrito): ${e.target.parentElement}`)
        setCarrito(e.target.parentElement)
    }
    e.stopPropagation();// esto para evitar cualquier otro evento no deseado que pudiera generarse
}

const setCarrito = objeto => {
    const producto = {
        id: objeto.querySelector('.btn-dark').dataset.id,
        title:  objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1
    }
    // A continuacion hacemos que aumente solo su cantidad
        if (carrito.hasOwnProperty(producto.id)) {
            producto.cantidad = carrito[producto.id].cantidad + 1;
        }  // estas son para recorrer un objetos

    // A continuacion enviamos esto al objeto
    carrito[producto.id] = {...producto} // los 2 puntos son para hacer una copia sin usar el espacion en memoria
    pintarCarrito()
}

// ahora que enviamos los datos al carrito, tenemos que pintarlo por el DOM

const pintarCarrito = () => {
    // Aqui recorremos el objeto para aumentar la cantidad, colocamos " items.innerHTML = '' ", para que solo nos afecte los numeros, y no se sobreescriba la informacion
    items.innerHTML = ''
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad 
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)

    pintarFooter()

    localStorage.setItem('carrito',JSON.stringify(carrito))
}
// Aqui dependiendo si el carrito esta vacio o no, se hara lo siguiente
const pintarFooter = () => {
    footer.innerHTML = ''
    if(Object.keys(carrito).length === 0) {
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        ` // Aqui podemos usar este ya que solo es una linea

        return // Con el return la condicionamos que las siguientes lineas no las lea, y asi no siga ejecutandolas
    }
    //Ahora necesitamos sumar las cantidades para colocar la cantidad total
    const nCantidad = Object.values(carrito).reduce((acc,{cantidad}) => acc + cantidad, 0);
    const nPrecio = Object.values(carrito).reduce((acc,{cantidad,precio}) => acc + cantidad *precio, 0);

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    // A continuacion modificamos el boton de vaciar carrito
    const btnVaciar = document.getElementById('vaciar-carrito')
    btnVaciar.addEventListener('click', () => {
        carrito = {};
        pintarCarrito();
    })
} 

// Ahora detectamos los botones de agregar o eliminar
items.addEventListener('click', e => {
    btnAccion(e)
})

const btnAccion = e => {
    //Accion de aumentar
    if(e.target.classList.contains('btn-info')) {
        carrito[e.target.dataset.id]
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = {...producto}
    }
    else if(e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if(producto.cantidad === 0){
            delete carrito[e.target.dataset.id]
        }
    }
    pintarCarrito();
    e.stopPropagation();
}






