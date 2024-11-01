import Swal from 'sweetalert2';
import { cleanMessageValidation, cleanModal, insertItems, insertMessgeValidate, toastController } from './app.js';

const maxImages = 4;
const imageContainers = document.getElementById('imageContainers');

let table = $('#table').DataTable({
    processing: true,
    serverSide: true,
    ajax: {
        url: "api/product/get",
        error: function (xhr) {
            if (xhr.status === 401) {
                window.location.href = '/login';
            }
        }
    },
    order: [[2, 'desc']],
    columns: [
        { data: "id" },
        { data: "name" },
        { data: "unit_measure" },
        { data: "shipment_date" },
        { data: "stock" },
        { data: "brand.name" },
        // {
        //     data: "created_at",
        //     render: function (data, type, row) {
        //         // Formatear la fecha y hora
        //         var fecha = new Date(data);
        //         return fecha.toLocaleDateString();
        //     }
        // },
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
      
            <button class="btn btn-success btn-sm" data-bs-toggle="modal"
                          data-bs-target="#modalImages" id="modalPhotos">
                    <i class='bx bx-image'></i>
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
        $(row).find('#modalPhotos').attr('data-id', data.id);
    }
});


let method;
let url;
let mainId;
// Abrir modal de registro
$('body').on('click', '#btnModalRegister', function () {
    cleanModal("#form", '#closeModal');

    $('#modalCenterTitle').text('Registrar Producto')

    url = 'api/product/register';
    method = 'POST';

    $('#brand_id').empty().trigger('change');
    cleanMessageValidation();
})

// Abrir modal para edicion
$('body').on('click', '#edit', function () {
    $('#brand_id').empty().trigger('change');

    $('#modalCenterTitle').text('Actualizar Producto');
    mainId = $(this).data('id');

    url = 'api/product/update/' + mainId;
    method = 'PUT';

    $.ajax({
        url: 'api/product/get/' + mainId,
        success: function (response) {
            console.log('DATA: ', response.data);


            let brandId = response.data.brand_id;
            let brandName = response.data.brand.name;

            // Prellenar el select con el valor preseleccionado
            let newOption = new Option(brandName, brandId, false, false);
            $('#brand_id').append(newOption).val(brandId);

            $('#nameItemModal').text(response.data.name);
            insertItems(response.data)
        },
        error: function (error) {
            alert('Error interno. Contactse con el proovedor: ' + error)
        }
    })
})

// Solicitud para reigstrar Producto
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

// Activar o desactivar Producto
$('body').on('click', '#delete', function () {
    const id = $(this).data('id');

    $.ajax({
        url: 'api/product/changestatus/' + id,
        method: 'PUT',
        success: function (response) {
            console.log('DISABLED: ', response);
            if (response.success) {
                table.ajax.reload(null, false);
            } else {
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

// Deliminar 
$('body').on('click', '#btnReset', function () {
    $.ajax({
        url: 'api/product/delete/' + mainId,
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


// Evento de input file para cargar y mostrar la imagen
$('body').on('input', '#fileInput', function (event) {
    const files = Array.from(event.target.files);
    console.log('FILESS: ', files);


    if (files.length + images.length > maxImages) {
        Swal.fire({
            position: "top-center",
            icon: "error",
            title: "Solo se permiten Hasta 5 imagenes",
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }

    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e) {

                images.push({
                    'image': e.target.result,
                    'main': mainImage,
                    name: (images.length + 1)
                });

                if (images.length <= maxImages) {
                    imageContainers.innerHTML = ''; 
                    const columns = [
                        [],
                        [],
                        [],
                        [],
                        []
                    ];

                    // Distribuir imágenes en las columnas
                    images.forEach((image, index) => {

                        columns[index].push(image.image); 
                    });

                    // aladir imagenes a las columnas
                    columns.forEach((columnImages, colIndex) => {
                        const colDiv = document.createElement('div');
                        colDiv.className = `col-xs-6 col-sm-4 image-column`;
                        columnImages.forEach(image => {
                            const imageDiv = document.createElement('div');
                            imageDiv.className = 'thumbnail';
                            imageDiv.innerHTML = `
                  <img src="${image}" alt="Imagen" class="img-responsive-custom">
                  <div class="caption">
                    <label class="radio-inline" id="mainImgRadio" title="Marcar como foto principal" data-index="${colIndex}">
                      <input type="radio" name="mainImage"> <p class="inputRadio">Principal</p>
                    </label>
                  </div>
                `;
                            colDiv.appendChild(imageDiv);
                        });
                        imageContainers.appendChild(colDiv);
                    });
                }
            };
            reader.readAsDataURL(file);
        } else {
            alert('Solo se pueden seleccionar archivos de imagen.');
            Swal.fire({
                position: "top-center",
                icon: "error",
                title: "Solo se pueden seleccionar archivos de imagen.",
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
});
// })

//SETEAR IMAGEN PRINCIPAL
$('body').on('click', '#mainImgRadio', function () {
    let index = $(this).data('index');

    // Se resstablece todo los main 0
    for (let i = 0; i < images.length; i++) {
        images[i].main = 0;
    }
    // Se da el valor 1 a main a la imagen corrspoenidente
    images[index].main = 1;

})

// Función globlar para petcion de guardar imagenes en el servidor
function uploadImages(imagesArray, id, imageId = null) {
    console.log('IMGENS QUE SE VANN A CARGAR: ', imagesArray);
    $('#modalImages').modal('hide')

    Swal.fire({
        title: 'Cargando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    }).then(()=>{
        $('#modalImages').modal('show')
    });


    $.ajax({
        url: 'api/product/loadImages',
        method: 'POST',
        data: {
            'images': imagesArray,
            id,
            imageId
        },
        success: function (response) {
            console.log('CARGA IMAGES: ', response);
            console.log('ID DE IMG: ', imageId);

            loadImagesContainer(mainId)
            Swal.fire({
                icon: response.status == true ? "success" : 'error',
                title: response.title,
                text: response.message,
                showConfirmButton: false,
                timer: 1500
            });
        },
        error: function (error) {
            //console.log('ERROR: ', error);
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: error.message,
                showConfirmButton: false,
                timer: 1500
            });
        }
    })
}


// Funcion global que consulta y muestra las imagenes
function loadImagesContainer(id, base64 = null) {
    $.ajax({
        url: 'api/product/getImages/' + id,
        success: function (response) {
            console.log('IMAGES GET: ', response);

            const files = response;
            const maxContainers = maxImages;
            const defaultImageUrl = 'add_more.svg';
            let images = [];

            for (let i = 1; i <= maxImages; i++) {
                let imageFound = false;

                files.forEach(file => {
                    const [nameWithoutExtension] = file.name.split('.');
                    const imageNumber = parseInt(nameWithoutExtension, 10);

                    if (imageNumber === i) {
                        images.push({
                            name: file.product_id + '/' + file.name,
                            main: file.main,
                            product_id: file.product_id,
                            id: file.id,
                            original: file.name
                        });
                        imageFound = true;
                    }
                });

                if (!imageFound) {
                    images.push({
                        name: defaultImageUrl,
                        main: false,
                        product_id: null,
                        id: null,
                        original: null
                    });
                }
            }
            Swal.close();

            // Limitar el número de imágenes a 5
            images = images.slice(0, maxContainers);

            // Limpiar el contenedor antes de agregar nuevas imágenes
            imageContainers.innerHTML = '';
            const columns = [
                [],
                [],
                [],
                [],
                []
            ];

            // Distribuir imágenes en las columnas
            images.forEach((image, index) => {
                columns[index].push(image);
            });

            // Agregar imágenes a las columnas
            columns.forEach((columnImages, colIndex) => {
                // Crear el contenedor de columna para las imágenes
                const colDiv = document.createElement('div');
                colDiv.className = `col-6 col-md-4 image-column`;
            
                // Iterar a través de cada imagen en la columna
                columnImages.forEach(image => {
                    // Crear el contenedor de la tarjeta de imagen
                    const imageDiv = document.createElement('div');
                    imageDiv.className = 'card mb-3 position-relative'; // Agregar 'position-relative' para el posicionamiento del icono
            
                    // HTML del contenido de la imagen
                    imageDiv.innerHTML = `
                        <img src="/image_file/${image.name}?t=${new Date().getTime()}" 
                            id="imgContainer" 
                            data-id="${image.id}" 
                            data-pet="${image.product_id}" 
                            data-main="${image.main}" 
                            alt="Imagen" 
                            class="img-fluid imgContainer img-responsive-custom" 
                            style="cursor: pointer; object-fit: contain; width: 100%; height: 200px;">
                        
                        <!-- Input de archivo oculto para cambiar imagen -->
                        <input type="file" class="d-none" name="img" id="fileInputImg-${image.id}">
                        
                        <!-- Contenedor del radio para marcar como principal -->
                        <div class="caption d-flex ${!image.id ? 'd-none' : ''} containerToHidde">
                            <label class="form-check-label" id="mainImgRadioUpdate" data-id="${image.id}" title="Marcar como foto principal" data-index="${colIndex}">
                                <input type="radio" id="radioInput-${image.id}" name="mainImage" class="form-check-input"> 
                                <p class="inputRadio">Principal</p>
                            </label>
                        </div>
                        
                        <!-- Icono para eliminar imagen -->
                        <div class="container-trash bg-danger p-1 rounded ${!image.id ? 'd-none' : ''} containerToHidde" 
                             id="deletePhoto" 
                             data-id="${image.id}" 
                             data-name="${image.original}" 
                             style="position: absolute; top: 10px; right: 10px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <g class="trash-outline">
                                    <g fill="white" fill-rule="evenodd" class="Vector" clip-rule="evenodd">
                                        <path d="M4.917 6.003a1 1 0 0 1 1.08.914l.849 10.248A2 2 0 0 0 8.839 19h6.322a2 2 0 0 0 1.993-1.835l.85-10.248a1 1 0 0 1 1.993.166l-.85 10.247A4 4 0 0 1 15.162 21H8.84a4 4 0 0 1-3.987-3.67l-.85-10.247a1 1 0 0 1 .914-1.08"/>
                                        <path d="M3 7a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1m7 2a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1m4 0a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0v-4a1 1 0 0 1 1-1"/>
                                        <path d="M10.441 5a1 1 0 0 0-.948.684l-.544 1.632a1 1 0 1 1-1.898-.632l.544-1.633A3 3 0 0 1 10.441 3h3.117a3 3 0 0 1 2.846 2.051l.545 1.633a1 1 0 0 1-1.898.632l-.544-1.632A1 1 0 0 0 13.56 5h-3.117Z"/>
                                    </g>
                                </g>
                            </svg>
                        </div>
                    `;
            
                    // Añadir la tarjeta de imagen al contenedor de la columna
                    colDiv.appendChild(imageDiv);
                });

                imageContainers.appendChild(colDiv);
            });


            // Marcar la imagen principal si es necesario
            files.forEach(file => {
                setTimeout(() => {
                    $(`#radioInput-${file.id}`).prop('checked', file.main == 1);
                }, 0);
            });

        },
        error: function (error) {
            console.log('ERROR: ', error);
            Swal.fire({
                position: "top-center",
                icon: "success",
                title: error.message,
                showConfirmButton: false,
                timer: 1500
            });

        }
    })
}

// Funcion abrir el modal y llamar la funcion encargada de mostrar las imagenes
$('body').on('click', '#modalPhotos', function () {
    Swal.fire({
        title: 'Cargando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });

    $('.btnd-none').addClass('d-none');
    $('.btnd-none').addClass('d-none');

    mainId = $(this).data('id');

    $('#imageContainers').empty();

    loadImagesContainer(mainId)

})


//click ne los contenedores y asignar el respectivo nombre - llama la funcion de subir las imagenes al servidor
$('body').on('click', '.imgContainer', function () {

    const container = $(this);

    console.log('CONTAINER CLICKED: ', container);

    const id = container.data('id');
    const index = $('.img-responsive-custom').index(container);
    let mainUpdate = container.data('main');

    // Abrir input file
    $('#fileInputImg-' + id).click();

    // Manejar el cambio en el input file
    $('#fileInputImg-' + id).off('change').on('change', function () {
        const file = this.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const selectedImageBase64 = e.target.result;

            let imageUpdate = [];
            imageUpdate.push({
                image: selectedImageBase64,
                name: (index + 1),
                main: mainUpdate
            });
            uploadImages(imageUpdate, mainId, id);

            $('.containerToHidde').removeClass('d-none')

        };

        if (file) {
            reader.readAsDataURL(file);
        }
    });
});

// Funcion para actualizar la imagen a main por medio del input radio
$('body').on('click', '#mainImgRadioUpdate', function () {
    const id = $(this).data('id');

    $('#modalImages').modal('hide');

    Swal.fire({
        title: 'Cargando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: 'api/product/updateImage',
        method: 'PUT',
        data: {
            'id': id,
            'productId': mainId
        },
        success: function (response) {
            console.log('RESP MAIN: ', response);

            Swal.fire({
                position: "top-center",
                icon: "success",
                title: response.message,
                showConfirmButton: true,
                timer: 1000
            }).then(() => {
                $('#modalImages').modal('show');
            });

        },
        error: function (error) {
            console.log('ERROR UPDATE MAIN: ', error);
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: error.message,
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                $('#modalImages').modal('show');
            });

        }
    })

})

// Ejecuta la función de eliminar foto
$('body').on('click', '#deletePhoto', function () {
    const id = $(this).data('id');
    const name = $(this).data('name');

    $('#modalImages').modal('hide');

    Swal.fire({
        title: "¿Desea eliminar la foto?",
        text: "Este proceso no se podrá revertir",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: "Cancelar",
        confirmButtonText: "Confirmar"

    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Cargando...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });

            $.ajax({
                url: 'api/product/deleteImage',
                method: 'DELETE',
                data: {
                    id: id,
                    productId: mainId,
                    name: name
                },
                success: function (response) {
                    console.log('delete rep: ', response);

                    if (response.status == true) {
                        Swal.fire({
                            title: response.title,
                            text: response.message,
                            icon: "success"

                        });
                        loadImagesContainer(mainId)
                    } else {
                        Swal.fire({
                            title: response.title,
                            text: response.message,
                            icon: "error"
                        });
                    }
                },
                error: function (error) {

                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "error interno, contacte al proovedor/" + error,
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            })

            $('#modalImages').modal('show');
        }
        $('#modalImages').modal('show');
    });

})