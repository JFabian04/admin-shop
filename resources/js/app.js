
import jQuery, { error } from 'jquery';
import DataTable from 'datatables.net-dt';
import 'datatables.net-responsive';
// import 'animate.css';

// COnfigruacion global para jquery
window.$ = window.jQuery = jQuery;
$.ajaxSetup({
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'), 
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    },

});



// Un fetch global que ya tenga el header con el token
export function customFetch(url, options = {}) {
  
    options.headers = {
        ...options.headers, 
        'Authorization': 'Bearer ' + localStorage.getItem('token') 
    };

    return fetch(url, options);
}

// Función para proteger rutas URL
let userId;

async function authenticate() {
    try {
        const response = await customFetch('api/auth');

        if (!response.ok) {
            throw new error('HTTP ERROR' + response.status)
        }

        const data = await response.json();

        // console.log('URL: ', data.authorized);

        if (data.authorized) {
            localStorage.setItem('user_id', data.user_id)
            userId = localStorage.getItem('user_id');
            if (userId) {
                getDataAdmin();
            }

        }

        if (window.location.pathname == '/login' && data.authorized == true) {
            window.location.href = '/'
        } else if (window.location.pathname != '/login' && data.authorized == false) {
            window.location.href = '/login'
        }



    } catch (error) {
        console.log(error);
        
        if (error != 'TypeError: Failed to fetch') {
            alert(error)
        }
    }
}
authenticate();



// DATATABLE TRADUCTION
$.extend(true, $.fn.dataTable.defaults, {
    language: {
        "decimal": "",
        "emptyTable": "No hay información",
        "info": "Mostrando _START_ a _END_ de _TOTAL_ Entradas",
        "infoEmpty": "Mostrando 0 to 0 of 0 Entradas",
        "infoFiltered": "(Filtrado de _MAX_ total entradas)",
        "infoPostFix": "",
        "thousands": ",",
        "lengthMenu": "Mostrar _MENU_ Entradas",
        "loadingRecords": "Cargando...",
        "processing": "",
        "search": "Buscar:",
        "zeroRecords": "Sin resultados encontrados",
        "paginate": {
            // "first": "1",
            // "last": "Ultimo",
            // "next": ">>",
            // "previous": "Anterior"
        }
    },
});


// Insert message errors validations
export function insertMessgeValidate(validateErrors) {
    let keysValidate = Object.keys(validateErrors);
    let valueValidate = Object.values(validateErrors);

    console.log('keys: ', keysValidate);
    console.log('error: ', valueValidate);
    if ($('.error-validate').text() != '') {
        $('.error-validate').text('')
    }

    for (let i = 0; i < keysValidate.length; i++) {
        $('#error-' + keysValidate[i]).text(valueValidate[i]);
        console.log('.error-' + keysValidate[i] + '---------' + valueValidate[i]);
    }
}

// Limpiar errores de validacion
export function cleanMessageValidation() {
    if ($('.error-validate').text() != '') {
        $('.error-validate').text('')
    }
}


// Toast Controller
export function toastController(title, text) {
    $('#titleToast').text(title);
    $('#bodyToast').text(text);

    $('#toastAlert').addClass('show');

    setTimeout(() => {
        $('#toastAlert').removeClass('show');
    }, 5000)
}


// Cerrar y Limpiar modales
export function cleanModal(idForm, closeBtn) {
    $(closeBtn).click();
    $(idForm)[0].reset();
    cleanMessageValidation()
    $('#nameItemModal').empty();

}

// Insertar datos en el formulario
export function insertItems(data) {
    let keys = Object.keys(data);
    // console.log('KEYS: ', data);

    for (let i = 0; i < keys.length; i++) {
        $('#' + keys[i]).val(data[keys[i]])
    }
}

// Establece la fecha actual como el valor máximo del campo de entrada
const today = new Date().toISOString().split('T')[0];

$('.dateInputReport').attr('max', today);


// Cargar Info del ADMIN
function getDataAdmin() {
    $.ajax({
        url: 'api/user/get/' + userId,
        success: function (response) {
            console.log('DATA  USER: ', response);
            if (response.success) {
                $('#nameUser').text(response.data.name);
                $('#role').text(response.data.role);
                // Cargar el user al modal
                $('.nameUser').val(response.data.name);
            } else {
                window.location.href = '/login'
            }
        },
        error: function (error) {
            console.log('ERROR GET DATA USER: ', error);
            alert('Error interno del servidor: ', error)
        }
    })
}
// getDataAdmin();

// Enviar formulario para actualizar data del admin
$('body').off('submit', '#formDataAdmin').on('submit', '#formDataAdmin', function (e) {
    e.preventDefault();

    const data = $(this).serialize();

    $.ajax({
        url: 'api/user/updateDataAdmin/' + userId,
        method: 'PUT',
        data: data,
        success: function (response) {
            console.log('ADMIN UPDATED: ', response);
            if (response.success) {
                getDataAdmin();
                cleanModal("#formDataAdmin", '#closeModal');

            }
        },
        error: function (error) {
            console.log('ERROR UPDATE ADMIN: ', error);
        }
    });
});


// Validar lo de contraseña y confirmar contraseña
$('body').on('input', '#name', function () {

    if ($('#password').val() == '' || $('#conPassword').val() == '') {
        $('#btnActualizar').removeAttr('disabled')
        // $('#btnActualizar').removeClass('opacity-60')
    }

})

$('body').on('input', '#password, #conPassword', function () {
    $('#btnActualizar').attr('disabled', true)
    // $('#btnActualizar').addClass('opacity-60')

    let password = $('#password').val();
    let conPassword = $('#conPassword').val();

    console.log('PASS: ' + password + '  ' + 'CONFIRMAR: ' + conPassword);

    if (conPassword !== '' && password !== conPassword) {
        $('#passwordError').removeClass('d-none');
        $('#btnActualizar').attr('disabled', true)

        if (password.length >= 4) {
            $('#passwordErrorLength').addClass('d-none');
        }

    } else if (conPassword !== '' && password.length >= 4 && conPassword.length >= 4) {
        $('#btnActualizar').removeAttr('disabled')
        // $('#btnActualizar').removeClass('opacity-60')
        $('#passwordErrorLength').addClass('d-none');
        $('#passwordError').addClass('d-none');
    } else if (password.length < 4 && password.length > 0) {
        $('#passwordErrorLength').removeClass('d-none');
        $('#btnActualizar').removeAttr('disabled')

    } else {
        $('#passwordErrorLength').addClass('d-none');
    }
});


// Abrir modal Mi Perfil
$('body').on('click', '#myProfile', function () {
    $('#passwordErrorLength').val();
    $('#passwordError').val();
})

// Cerrar Sesión
$('body').off('click', '#logout').on('click', '#logout', function () {
    $.ajax({
        url: 'api/logout',
        method: 'POST',
        success: function (response) {
            console.log('LOGOUT: ', response);

            window.location.href = '/login';
        },
        error: function (error) {
            console.log('Error Logout: ', error);
            alert('Error en el cierre de sesión. Contacte al proovedor: ' + error)
        }
    })
})


