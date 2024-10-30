<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    //Función privada para obtener todos los regisotr en un array
    private function getAll()
    {
        try {
            $data = Product::all();

            return ['status' => true, 'data' => $data];
        } catch (\Throwable $th) {
            return ['status' => false, 'error' => $th->getMessage()];
        }
    }

    // Funcion que se encargar de retortnar los datos para DataTable
    public function gatAllTable()
    {
        $data = $this->getAll();
        // dd($data);
        if ($data['status'] == true) {
            return datatables()->of($data['data'])->toJson();
        } else {
            return response()->json(['status' => false, 'Error interno del servidor: ' . $data['error']], 500);
        }
    }

    // Obtener marcas para responde en JSON
    public function gatAllObject()
    {
        $data = $this->getAll();
        if ($data['status'] == true) {
            return response()->json(['status' => true, 'data' => $data['data']], 200);
        } else {
            return response()->json(['status' => false, 'Error interno del servidor: ' . $data['error']], 500);
        }
    }

    // Funcion para Registrar
    public function store(ProductRequest $request)
    {
        try {
            $data = $request->all();

            Product::create($data);
            return response()->json(['status' => true, 'title' => 'Correcto!', 'message' => 'Registro realizado con éxito.'], 200);
        } catch (\Throwable $th) {
            return response()->json(['status' => false, 'Error interno del servidor: ' . $th->getMessage()], 500);
        }
    }

    // Funcion para Obtener por ID
    public function show($id)
    {
        try {
            $item = Product::find($id);

            return response()->json(['status' => true, 'data' => $item]);
        } catch (\Throwable $th) {
            return response()->json(['status' => false, 'Error interno del servidor: ' . $th->getMessage()], 500);
        }
    }

    // Funcion para editar una marca por parametro ID
    public function update(ProductRequest $request, $id)
    {
        try {
            $item = Product::find($id);

            $item->update($request);

            return response()->json(['status' => true, 'title' => 'Correcto!', 'message' => 'Actualización realizada con éxito.']);
        } catch (\Throwable $th) {
            return response()->json(['status' => false, 'Error interno del servidor: ' . $th->getMessage()], 500);
        }
    }

    // Función para activar/desactivar
    public function changeStatus($id)
    {
        try {
            $item = Product::find($id);

            if ($item) {
                $item->update(['status' => !$item->status]);

                return response()->json(['status' => true, 'title' => 'Actualizado!', 'message' => 'El estado fue cambiado.'], 200);
            } else {
                return response()->json(['status' => false, 'title' => '404!', 'message' => 'Ocurrió un error. Intente nuevamente.'], 200);
            }
        } catch (\Throwable $th) {
            return response()->json(['status' => false, 'Error interno del servidor: ' . $th->getMessage()], 500);
        }
    }

    // Función para eliminar
    public function destroy($id)
    {
        try {
            $item = Product::find($id);

            if ($item) {
                $item->delete();
                return response()->json(['status' => true, 'title' => 'Eliminado!', 'message' => 'El registro se eliminó con éxito.'], 200);
            } else {
                return response()->json(['status' => false, 'title' => '404!', 'message' => 'Ocurrió un error. Intente nuevamente.'], 200);
            }
        } catch (\Throwable $th) {
            return response()->json(['status' => false, 'Error interno del servidor: ' . $th->getMessage()], 500);
        }
    }
}