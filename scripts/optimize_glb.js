import { WebIO } from '@gltf-transform/core';
import {
    DracoMeshCompression,
    MeshQuantization
} from '@gltf-transform/extensions';
import {
    simplify,
    resize,
    prune,
    dedup,
    join,
    weld,
    draco,
    quantize
} from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import fs from 'fs';
import path from 'path';

async function optimize() {
    console.log('Initializing IO...');
    const io = new WebIO()
        .registerExtensions([DracoMeshCompression, MeshQuantization])
        .registerDependencies({
            'draco3d.encoder': await draco3d.createEncoderModule(),
            'draco3d.decoder': await draco3d.createDecoderModule(),
        });

    console.log('Reading model...');
    const doc = await io.read('public/models/drone.glb');

    console.log('Renaming components...');
    doc.getRoot().listMeshes().forEach((mesh) => {
        const name = mesh.getName().toLowerCase();
        if (name.includes('fanbase')) {
            mesh.setName('fanbase');
        } else if (name.includes('circle_outer')) {
            mesh.setName('circle_outer');
        } else if (name.includes('innercircle')) {
            mesh.setName('innercircle');
        }
    });

    console.log('Welding, joining, and pruning...');
    await doc.transform(
        weld(),
        join(),
        dedup(),
        prune()
    );

    console.log('Resizing textures...');
    await doc.transform(
        resize({ width: 1024, height: 1024 })
    );

    console.log('Simplifying geometry...');
    // Target ~40,000 triangles.
    // The model currently has well over 200k.
    // We'll use a ratio of 0.05 to be safe and hit the < 40k target.
    await doc.transform(
        simplify({ simplifier: MeshoptSimplifier, ratio: 0.05, error: 0.01 })
    );

    console.log('Applying compression...');
    await doc.transform(
        draco(),
        quantize()
    );

    console.log('Writing optimized model...');
    const glb = await io.writeBinary(doc);
    fs.writeFileSync('public/models/drone_optimized.glb', glb);
    console.log('Optimization complete! Saved to public/models/drone_optimized.glb');
}

optimize().catch((err) => {
    console.error('Optimization failed:', err);
    process.exit(1);
});
