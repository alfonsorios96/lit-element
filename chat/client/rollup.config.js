import resolve from '@rollup/plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';
import copy from 'rollup-plugin-copy';
import uglify from '@lopatnov/rollup-plugin-uglify';

const name = `${((new Date()).getTime())}.bundled.js`;

const filesizeConfig = {
    showGzippedSize: true,
    showBrotliSize: true,
    showMinifiedSize: true,
};

const copyConfig = {
    targets: [
        {
            src: 'index.html',
            dest:'dist',
            transform: (content) => {
                content = content.toString().replace('ChatApp.js', `./${name}`);
                content = content.toString().replace('<!-- SW -->', `
                    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
                initialiseState();
            }, error => {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', error);
            });
        });
    }
                `);
                return content;
            }
        },
        {
            src: 'style.css',
            dest: 'dist'
        },
        {
            src: 'inbox.json',
            dest: 'dist'
        },
        {
            src: 'sw.js',
            dest: 'dist'
        }
    ]
};

const config = {
    input: './ChatApp.js',
    output: {
        file: `dist/${name}`
    },
    plugins: [
        resolve(),
        copy(copyConfig),
        uglify({
            output: {
                comments: function(node, comment) {
                    if (comment.type === "comment2") {
                        // multiline comment
                        return /@preserve|@cc_on/i.test(comment.value);
                    }
                    return false;
                }
            }
        }),
        filesize(filesizeConfig)
    ]
};

export default config;
