<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use App\Models\ProductFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class ProductController extends Controller
{
    //Función privada para obtener todos los regisotr en un array
    private function getAll()
    {
        try {
            $data = Product::query();

            return ['status' => true, 'data' => $data];
        } catch (\Throwable $th) {
            return ['status' => false, 'error' => $th->getMessage()];
        }
    }

    // Funcion que se encargar de retortnar los datos para DataTable
    public function gatAllTable()
    {
        $data = $this->getAll();


        if ($data['status'] == true) {
            $resp = $data['data']->with(['brand:id,name'])->get();
            return datatables()->of($resp)->toJson();
        } else {
            return response()->json(['success' => false, 'Error interno del servidor: ' . $data['error']], 500);
        }
    }

    // Obtener marcas para responde en JSON
    public function gatAllObject(Request $request)
    {
        $data = $this->getAll();


        if ($data['status'] == true) {

            $resp = $data['data']->with(['brand:id,name'])->with('product_files')->filterName($request->name)->where('status', 0)->paginate(10);
            // dd($resp);

            return response()->json($resp, 200);
        } else {
            return response()->json('Error interno del servidor: ' . $data['error'], 500);
        }
    }

    // Funcion para Registrar
    public function store(ProductRequest $request)
    {
        try {
            $data = $request->all();

            Product::create($data);
            return response()->json(['success' => true, 'title' => 'Correcto!', 'message' => 'Registro realizado con éxito.'], 200);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'Error interno del servidor: ' . $th->getMessage()], 500);
        }
    }


    // Funcion para Obtener por ID
    public function show($id)
    {
        try {
            $item = Product::with(['brand:id,name'])->find($id);

            return response()->json(['success' => true, 'data' => $item]);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'Error interno del servidor: ' . $th->getMessage()], 500);
        }
    }

    // Funcion para editar una marca por parametro ID
    public function update(ProductRequest $request, $id)
    {
        try {
            $item = Product::find($id);

            $item->update($request->all());

            return response()->json(['success' => true, 'title' => 'Correcto!', 'message' => 'Actualización realizada con éxito.']);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'Error interno del servidor: ' . $th->getMessage()], 500);
        }
    }

    // Función para activar/desactivar
    public function changeStatus($id)
    {
        try {
            $item = Product::find($id);

            if ($item) {
                $item->update(['status' => !$item->status]);

                return response()->json(['success' => true, 'title' => 'Actualizado!', 'message' => 'El estado fue cambiado.'], 200);
            } else {
                return response()->json(['success' => false, 'title' => '404!', 'message' => 'Ocurrió un error. Intente nuevamente.'], 200);
            }
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'Error interno del servidor: ' . $th->getMessage()], 500);
        }
    }

    // Función para eliminar
    public function destroy($id)
    {
        try {
            $item = Product::find($id);

            if ($item) {
                $item->delete();
                return response()->json(['success' => true, 'title' => 'Eliminado!', 'message' => 'El registro se eliminó con éxito.'], 200);
            } else {
                return response()->json(['success' => false, 'title' => '404!', 'message' => 'Ocurrió un error. Intente nuevamente.'], 200);
            }
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'Error interno del servidor: ' . $th->getMessage()], 500);
        }
    }

    // Funcón para contrlar las rutas en prod
    private function urlFolder($id)
    {
        // Ruta base de almacenamiento de archivos
        $publicDir = public_path('image_file');

        // Carpeta específica para la mascota
        $dirPath = $publicDir . '/' . $id;

        // Crear carpeta si no existe
        if (!File::exists($dirPath)) {
            File::makeDirectory($dirPath, 0755, true);
        }

        return $dirPath;
    }

    // Función para cargar las imagenes del producto
    public function uploadImages(Request $request)
    {
        $id = $request->id;
        $images = $request->images;

        // Validar la existencia de 'id' y que 'images' sea un array
        if (!$id || !is_array($images)) {
            return response()->json([
                'status' => false,
                'message' => 'Datos inválidos proporcionados.'
            ], 200);
        }

        // Definir la ruta para almacenar las imágenes
        $dirPath = app()->environment('production')
            ? base_path('../public_html/image_file/' . $id)
            : public_path('image_file/' . $id);

        if (!File::exists($dirPath)) {
            File::makeDirectory($dirPath, 0755, true);
        }

        try {
            foreach ($images as $imageObj) {
                $image = $imageObj['image'] ?? null;
                $name = $imageObj['name'];
                $mainValue = !empty($imageObj['main']) ? 1 : 0;

                // Verificar si la propiedad 'image' está presente y es una cadena
                if (
                    !$image || !is_string($image) ||
                    !preg_match('/^data:image\/(\w+);base64,(.+)$/', $image, $matches)
                ) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Formato de imagen inválido.'
                    ], 200);
                }

                // Procesar datos de la imagen
                $ext = $matches[1];
                $base64Data = $matches[2];
                $fileName = $name . '.' . $ext;
                $filePath = $dirPath . '/' . $fileName;

                // Si es una actualización, eliminar la imagen existente
                if ($request->imageId) {
                    File::delete($filePath);
                }

                // Guardar la imagen en el servidor
                File::put($filePath, base64_decode($base64Data));

                // Actualizar o crear el registro en la base de datos usando el modelo Picture
                ProductFile::updateOrCreate(
                    ['id' => $request->imageId ?? null],
                    [
                        'name' => $fileName,
                        'product_id' => $id,
                        'main' => $mainValue
                    ]
                );
            }

            return response()->json([
                'status' => true,
                'message' => 'Imágenes subidas correctamente.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error procesando las imágenes: ' . $e->getMessage()
            ], 500);
        }
    }

    // Actualizar imagen como principal
    public function updateMainImage(Request $request)
    {
        try {
            // Validar los parámetros necesarios
            $request->validate([
                'id' => 'required|integer',
                'productId' => 'required|integer'
            ]);

            $id = $request->input('id');
            $productId = $request->input('productId');

            // Restablecer todas las imágenes de la mascota a no principal
            ProductFile::where('product_id', $productId)
                ->update(['main' => 0]);

            // Establecer la imagen seleccionada como principal
            $updated = ProductFile::where('id', $id)
                ->update(['main' => 1]);

            if ($updated) {
                return response()->json([
                    'status' => true,
                    'title' => 'Correcto',
                    'message' => 'Actualizado'
                ], 200);
            } else {
                return response()->json([
                    'status' => false,
                    'title' => 'Error',
                    'message' => 'Intente nuevamente'
                ], 400);
            }
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'title' => 'Error',
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    // Función para cargar imagens de producto
    public function getImages($id)
    {
        $images = ProductFile::where('product_id', $id)->get();

        return response()->json($images, 200);
    }

    // Eliminar foto
    public function deletePhoto(Request $request)
    {
        try {
            // Validar los parámetros necesarios
            $request->validate([
                'id' => 'required|integer',
                'productId' => 'required|integer',
                'name' => 'required|string'
            ]);

            $id = $request->id;
            $productId = $request->productId;
            $name = $request->name;

            // Obtener el path de la carpeta de la mascota
            $dirPath = $this->urlFolder($productId);

            // Verificar y eliminar el archivo
            $filePath = $dirPath . '/' . $name;
            if (File::exists($filePath)) {
                File::delete($filePath);
            }

            // Eliminar el registro de la base de datos
            $deleted = ProductFile::where('id', $id)->delete();

            if ($deleted) {
                return response()->json([
                    'status' => true,
                    'title' => 'Eliminado!',
                    'message' => 'Foto eliminada'
                ], 200);
            } else {
                return response()->json([
                    'status' => false,
                    'title' => 'Error!',
                    'message' => 'Intente nuevamente'
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'title' => 'Error',
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }
}
