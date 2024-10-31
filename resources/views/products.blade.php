@extends('layouts.app')

@section('resources')
    @vite('resources/js/products.js')
@endsection

@section('content')
    <div class="container-xxl flex-grow-1 container-p-y">
        <h4 class="display-6 fw-bold mt-4">
            <span class="bg-label-primary p-2 rounded">
                Administración de Productos
            </span>
        </h4>
        <p>Administra las Productos de tu tienda.</p>

        <div class="d-flex justify-content-end m-4">
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalCenter"
                id="btnModalRegister">
                <i class='bx bxs-add-to-queue'></i>
                Registrar
            </button>
        </div>

        <div class="card">
            <div class="table-responsive text-nowrap p-4">

                <table class="table" id="table">
                    <thead>
                        <tr>
                            <th class="text-primary">Id</th>
                            <th class="text-primary">Nombre</th>
                            <th class="text-primary">Unidad de Medida</th>
                            <th class="text-primary">Fecha Desembarque</th>
                            <th class="text-primary">Cantidad</th>
                            <th class="text-primary">Marca</th>
                            <th class="text-primary">Estado</th>
                            <th class="text-primary">acciones</th>
                        </tr>
                    </thead>
                    <tbody class="table-border-bottom-0">

                    </tbody>
                </table>
            </div>
        </div>

    </div>

    <!-- Modal  para reigstrar/editar-->
    <div class="modal fade" id="modalCenter" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <form class="modal-content" id="form">
                <div class="modal-header">
                    <h5 class="display-6 text-primary fw-bold" id="modalCenterTitle"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                        id="closeModal"></button>
                </div>

                <div class="mx-4">
                    <p class="badge bg-label-danger" id="nameItemModal"></p>
                </div>

                <div class="modal-body">
                    <div class="row">
                        <div class="col mb-3">
                            <label for="nameWithTitle" class="form-label text-primary">Nombre</label>
                            <input type="text" name="name" id="name" class="form-control"
                                placeholder="Ingrese el Nombre" />
                            <div class="error-validate" id="error-name"></div>

                        </div>
                    </div>
                    <div class="row">
                        <div class="col mb-3">
                            <label for="nameWithTitle" class="form-label text-primary">Unidad de Medida</label>
                            <select name="unit_measure" id="unit_measure" class="form-control">
                                <option value="">Seleccione un opción</option>
                                <option value="Unidad">Unidad</option>
                                <option value="Display">Display</option>
                                <option value="Caja">Caja</option>
                            </select>
                            <div class="error-validate" id="error-unit_measure"></div>

                        </div>
                    </div>
                    <div class="row">
                        <div class="col mb-3">
                            <label for="nameWithTitle" class="form-label text-primary">Fecha Desembarque</label>
                            <input type="date" name="shipment_date" id="shipment_date" class="form-control">
                            <div class="error-validate" id="error-shipment_date"></div>

                        </div>
                        <div class="col mb-3">
                            <label for="nameWithTitle" class="form-label text-primary">Cantidad</label>
                            <input type="number" name="stock" id="stock" class="form-control">
                            <div class="error-validate" id="error-stock"></div>

                        </div>
                    </div>


                    <div class="row">
                        <div class="col mb-3">
                            <label for="nameWithTitle" class="form-label text-primary">Marca</label>
                            <select class="js-data-example-ajax form-control" name="brand_id" id="brand_id"
                                style="width: 100%"></select>
                            <div class="error-validate" id="error-brand_id"></div>



                        </div>
                    </div>

                    <div class="row">

                        <div class="col mb-3">
                            <label for="nameWithTitle" class="form-label text-primary">Observaciones</label>
                            <textarea class="form-control" name="observation" id="observation" rows="4"></textarea>

                            <div class="error-validate" id="error-observation"></div>

                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                        Cerrar
                    </button>
                    <button type="submit" class="btn btn-primary">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    {{-- Confirmar elimianr --}}
    <div class="modal fade" id="modalReset" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">¿Desea eliminar este producto?</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                        id="closeModalPalm"></button>
                </div>

                <small class="text-primary" style="margin-left: 25px" id="nameItemReset"></small>

                <div class="modal-body">
                    <p>Esta acción no se podrá revertir.</p>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-danger" id="btnReset" data-bs-dismiss="modal">
                        Eliminar
                    </button>

                </div>
            </div>
        </div>
    </div>

    {{-- Modal para imegenes --}}
    <div class="modal fade" id="modalImages" tabindex="-1" role="dialog" aria-labelledby="modalImagesLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title" id="modalImagesLabel">Cargar Imágenes</h4>
                </div>
                <form id="formImages" class="modal-body">
                    <!-- Botón para cargar archivos -->
                    <div class="form-group btnd-none">
                        <label class="btn btn-primary btn-file">
                            <input type="file" class="hidden" name="images[]" id="fileInput" multiple
                                accept="image/*">
                            Seleccionar Imágenes
                        </label>
                    </div>

                    <!-- Contenedores para mostrar imágenes -->
                    <div class="row" id="imageContainers">
                        <!-- Las imágenes cargadas se mostrarán aquí -->
                    </div>
                </form>
                <div class="modal-footer">
                    <button id="btnExit" type="button" class="btn btn-default" data-bs-dismiss="modal">Cerrar</button>
                    <button type="submit" class="btn btn-primary btnd-none" id="loadImages">Guardar</button>
                </div>
            </div>
        </div>
    </div>



    <script>
        // Traduccion de SELECT2
        const traduction = {
            searching: function() {
                return "Buscando..."; // Texto personalizado al buscar
            },
            noResults: function() {
                return "No se encontraron resultados"; // Texto personalizado cuando no hay resultados
            },
            inputTooShort: function(args) {
                return `Por favor, ingrese ${args.minimum - args.input.length} o más caracteres`; // Mensaje para caracteres insuficientes
            },
            loadingMore: function() {
                return "Cargando más resultados..."; // Texto al cargar más resultados
            },
            maximumSelected: function(args) {
                return `Solo puede seleccionar ${args.maximum} elementos`; // Texto al alcanzar el máximo de selección
            }
        }

        // Select para los municipios
        $('#brand_id').select2({
            dropdownParent: $('#modalCenter'),
            language: traduction,
            ajax: {
                url: 'api/brand/getJson', // Cambia esta URL por la de tu API
                dataType: 'json',
                method: 'post',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                data: function(params) {
                    return {
                        name: params.term // Este es el término de búsqueda que se enviará al backend
                    };
                },
                delay: 250,
                processResults: function(data) {
                    // Aquí mapeamos los datos para que Select2 entienda
                    return {
                        results: data.map(function(item) {
                            return {
                                id: item.id,
                                text: item.name // Usamos 'nombre' en lugar de 'text'
                            };
                        })
                    };
                }
            }
        });
    </script>
@endsection
