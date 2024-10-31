<?php

// use App\Http\Controllers\AuthController;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// LOGIN y AUTENTICACION
Route::get('/auth', [AuthController::class, 'authenticate']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('brand')->group(function () {
        Route::get('/get', [BrandController::class, 'gatAllTable']);
        Route::post('/getJson', [BrandController::class, 'gatAllObject']);
        Route::post('/register', [BrandController::class, 'store']);
        Route::get('/get/{id}', [BrandController::class, 'show']);
        Route::put('/update/{id}', [BrandController::class, 'update']);
        Route::delete('/delete/{id}', [BrandController::class, 'destroy']);
        Route::put('/changestatus/{id}', [BrandController::class, 'changeStatus']);
    });

    Route::prefix('product')->group(function () {
        Route::get('/get', [ProductController::class, 'gatAllTable']);
        Route::post('/getJson', [ProductController::class, 'gatAllObject']);
        Route::post('/register', [ProductController::class, 'store']);
        Route::get('/get/{id}', [ProductController::class, 'show']);
        Route::put('/update/{id}', [ProductController::class, 'update']);
        Route::delete('/delete/{id}', [ProductController::class, 'destroy']);
        Route::put('/changestatus/{id}', [ProductController::class, 'changeStatus']);

        Route::post('/loadImages', [ProductController::class, 'uploadImages']);
        Route::get('/getImages/{id}', [ProductController::class, 'getImages']);
        Route::delete('/deleteImage', [ProductController::class, 'deletePhoto']);
        Route::put('/updateImage', [ProductController::class, 'updateMainImage']);
    });

    Route::prefix('user')->group(function () {
        Route::get('/get/{id}', [UserController::class, 'show']);
        Route::put('/updateDataAdmin/{id}', [UserController::class, 'updateDataAdmin']);
    });
    
});


