<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'unit_measure',
        'observation',
        'stock',
        'shipment_date',
        'status',
        'brand_id',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function product_files(): HasMany
    {
        return $this->hasMany(ProductFile::class);
    }

    public function scopeFilterName($query, $name)
    {
        if ($name) {
            $query->where('name', 'LIKE', "$name%");
        }
    }
}
