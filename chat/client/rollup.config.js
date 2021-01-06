import resolve from '@rollup/plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';
import copy from 'rollup-plugin-copy';

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
                content = content.toString().replace('node_modules/socket.io-client/dist/socket.io.js', 'socket.io.js');
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
        },
        {
            src: 'manifest.json',
            dest: 'dist'
        },
        {
            src: 'icon.png',
            dest: 'dist'
        },
        {
            src: 'node_modules/socket.io-client/dist/socket.io.js',
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
        filesize(filesizeConfig)
    ]
};

export default config;
