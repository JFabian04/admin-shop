<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductFile extends Model
{
    use HasFactory;

    protected $fillable =
    [
        'name',
        'main',
        'product_id'
    ];

    public function product_file(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
