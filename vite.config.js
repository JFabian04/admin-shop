import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import fg from 'fast-glob'; 

export default defineConfig({
    plugins: [
        laravel({
            input: [
                ...fg.sync(['resources/sass/**/*.scss']),
                ...fg.sync(['resources/js/**/*.js']),
            ],
            refresh: true,
        }),
    ],
    build: {
        outDir: 'public/build',
        assetsDir: '',
    }

});
