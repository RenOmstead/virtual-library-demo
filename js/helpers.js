/* ==========================================================
   HELPERS
========================================================== */

const $ = selector => document.querySelector(selector);

const $$ = selector => [...document.querySelectorAll(selector)];



function createElement(tag, className = ""){

    const element = document.createElement(tag);

    if(className){

        element.className = className;

    }

    return element;

}



function clearElement(element){

    while(element.firstChild){

        element.removeChild(element.firstChild);

    }

}



function uuid(){

    return crypto.randomUUID();

}



function save(key, value){

    localStorage.setItem(

        key,

        JSON.stringify(value)

    );

}



function load(key, fallback){

    const value = localStorage.getItem(key);

    if(!value){

        return fallback;

    }

    return JSON.parse(value);

}



function clamp(value, min, max){

    return Math.min(

        Math.max(value, min),

        max

    );

}



function capitalize(text){

    return text.charAt(0).toUpperCase() +

        text.slice(1);

}
