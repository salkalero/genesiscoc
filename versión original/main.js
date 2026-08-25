
document.addEventListener('DOMContentLoaded', () => {
    art2.classList.add('ocultar');
    norSan1.classList.add('ocultar');/* 
    art1.classList.remove('ocultar');
    norSan2.classList.remove('ocultar'); */
})
/**
 * Se capturan las etiquetas.
 */

// Donde se alamcenan los textos
const art1 = document.getElementById('textoNormas1');
const art2 = document.getElementById('textoNormas2');
const orgReg1 = document.getElementById('orgReg1');
const norSan1 = document.getElementById('norSan1');
const orgReg2 = document.getElementById('orgReg2');
const norSan2 = document.getElementById('norSan2');

// Se capturan los eventos
const btn1 = document.getElementById('btn1');
const btn2 = document.getElementById('btn2');
const btn3 = document.getElementById('btn3');
const btn4 = document.getElementById('btn3');
const btn5 = document.getElementById('btn3');
const btn6 = document.getElementById('btn3');

/* Limpieza */
function limpieza() {
    art1.classList.remove('ocultar');
    art2.classList.remove('ocultar');
    orgReg1.classList.remove('ocultar');
    norSan1.classList.remove('ocultar');
    orgReg2.classList.remove('ocultar');
    norSan2.classList.remove('ocultar');
}

btn1.addEventListener('click', () => { // Art.1 Guerras Diarias.
    console.log('click boton');
    limpieza();
    art2.classList.add('ocultar');
    norSan1.classList.add('ocultar');

});

btn2.addEventListener('click', () => { // Art.2 Liga de Clanes.
    console.log('click boton');
    limpieza();
    art1.classList.add('ocultar');
    norSan2.classList.add('ocultar');
});

btn3.addEventListener('click', () => { // Art.1 Organización y Registro.
    console.log('click boton');
    limpieza();
    art2.classList.add('ocultar');/* 
    orgReg1.classList.add('ocultar'); */
});

btn4.addEventListener('click', () => { // Art.1 Normas y Sanciones.
    console.log('click boton');
    limpieza();
    art2.classList.add('ocultar');
    orgReg1.classList.add('ocultar');
});

btn5.addEventListener('click', () => {
    console.log('click boton');
    limpieza();
});

btn6.addEventListener('click', () => {
    console.log('click boton');
    limpieza;
})

