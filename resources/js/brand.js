import { cleanModal, insertItems, insertMessgeValidate, toastController } from './app.js';


let table = $('#table').DataTable({
    processing: true,
    serverSide: true,
    ajax: {
        url: "api/brand/get",
        error: function (xhr) {
            if (xhr.status === 401) {
                window.location.href = '/login';
            }
        }
    },
    order: [[2, 'desc']],
    columns: [
        { data: "name" },
        { data: "identifier" },
        {
            data: "created_at",
            render: function (data, type, row) {
                // Formatear la fecha y hora
                var fecha = new Date(data);
                return fecha.toLocaleDateString();
            }
        },
        {
            data: "status",
            render: function (data, type, row) {
                let text;
                let color;

                text = data == 0 ? 'Activo' : 'Inactivo'
                color = data == 0 ? 'bg-label-success' : 'bg-label-danger'

                return '<span id="delete" class="badge ' + color + ' me-1 cursor-pointer">' + text + '</span>';
            }
        },
        { // Columna adicional
            data: null,
            defaultContent: `
            
            <button class="btn btn-primary btn-sm" data-bs-toggle="modal"
                          data-bs-target="#modalCenter" id="edit">
                    <i class='bx bxs-edit-alt'></i>
            </button>
      
            <button class="btn btn-danger btn-sm" data-bs-toggle="modal"
                          data-bs-target="#modalReset" id="reset">
                    <i class='bx bx-trash'></i>
            </button>
            `
        },
    ],
    createdRow: function (row, data) {
        $(row).find('#edit').attr('data-id', data.id);
        $(row).find('#delete').attr('data-id', data.id);
    }
});


let method;
let url;
let mainId;
// Abrir modal de registro
$('body').on('click', '#btnModalRegister', function () {
    cleanModal("#form", '#closeModal');

    $('#modalCenterTitle').text('Registrar Marca')

    url = 'api/brand/register';
    method = 'POST';
})

// Abrir modal para edicion
$('body').on('click', '#edit', function () {
    $('#modalCenterTitle').text('Actualizar Marca');
    mainId = $(this).data('id');

    url = 'api/brand/update/' + mainId;
    method = 'PUT';

    $.ajax({
        url: 'api/brand/get/' + mainId,
        success: function (response) {
            console.log('DATA: ', response.data);

            $('#nameItemModal').text(response.data.name);
            insertItems(response.data)
        },
        error: function (error) {
            alert('Error interno. Contactse con el proovedor: ' + error)
        }
    })
})

// Solicitud para reigstrar 
$('body').on('submit', '#form', function (e) {
    e.preventDefault();

    const data = $(this).serialize();

    $.ajax({
        url: url,
        method: method,
        data: data,
        success: function (response) {
            console.log('RESP: ', response);
            if (response.success == true) {
                toastController(
                    response.title,
                    response.message
                )
                cleanModal("#form", '#closeModal');

                table.ajax.reload(null, false);

            } else if (response.errors) {
                insertMessgeValidate(response.errors)
            }
        },
        error: function (error) {
            alert('Error interno. Contacte al proovedor: ' + error)
            console.log('ERRO REGISTER: ', error);

        }
    })
})

// Activar o desactivar 
$('body').on('click', '#delete', function () {
    const id = $(this).data('id');

    $.ajax({
        url: 'api/brand/changestatus/' + id,
        method: 'PUT',
        success: function (response) {
            console.log('DISABLED: ', response);
            if (response.success) {
                table.ajax.reload(null, false);
            }else{
                toastController(response.title, response.message)
            }
        },
        error: function (error) {
            console.log(error);
            alert('Error interno: ', error)
        }
    })
});

// Cargar ID para eliminar
$('body').on('click', '#reset', function () {
    let row = $(this).closest('tr');
    let rowData = $('#table').DataTable().row(row).data();

    $('#nameItemReset').text(rowData.name);

    mainId = rowData.id;
})

// Restaurar
$('body').on('click', '#btnReset', function () {
    $.ajax({
        url: 'api/brand/delete/' + mainId,
        method: 'delete',
        success: function (response) {
            table.ajax.reload(null, false);
            toastController(response.title, response.message)
        },
        error: function (error) {
            console.log('ERROR RESTORE: ', error);
            alert('Error interno del servidor: ' + error)

        }
    })

})