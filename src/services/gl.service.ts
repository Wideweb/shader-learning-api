import * as THREE from 'three';
import { logger } from '@utils/logger';

class GlService {
  public renderToTexture(vertexShader: string, fragmentShader: string, width: number, height: number): Uint8Array {
    logger.info(`Create renderer`);

    const canvas = {
      width,
      height,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      addEventListener: (event: any) => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      removeEventListener: (event: any) => {},
    };

    const glContext = require('gl')(width, height);

    // canvasGL.addEventListener = function (event, func, bind_) {}; // mock function to avoid errors inside THREE.WebGlRenderer()

    const renderer = new THREE.WebGLRenderer({ canvas, context: glContext });
    renderer.setPixelRatio(1);
    // renderer.setSize(width, height);
    renderer.autoClear = false;

    logger.info(`Create scene`);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
    camera.position.set(0, 0, 1);

    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        iResolution: {
          value: new THREE.Vector2(width, height),
        },
        iTime: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(0.5, 0.5, 0);
    scene.add(plane);

    logger.info(`Create frameTexture`);
    const frameTexture = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    const buffer = new Uint8Array(width * height * 4);

    renderer.setRenderTarget(frameTexture);
    renderer.setClearColor(0);
    renderer.clear(true, true, true);
    logger.info(`Render`);
    renderer.render(scene, camera);
    logger.info(`Read pixels`);
    renderer.readRenderTargetPixels(frameTexture, 0, 0, width, height, buffer);

    return buffer;
  }

  // public draw(vertexShader: string, fragmentShader: string): void {
  //   // const Canvas = require('canvas');
  //   // const glContext = require('gl')(1, 1); //headless-gl

  //   // const canvasGL = new Canvas(1024, 1024);
  //   // canvasGL.addEventListener = function (event, func, bind_) {}; // mock function to avoid errors inside THREE.WebGlRenderer()

  //   // const renderer = new THREE.WebGLRenderer({ context: glContext, antialias: true, canvas: canvasGL });
  //   const renderer = new THREE.WebGLRenderer();
  //   renderer.setPixelRatio(1);
  //   renderer.setSize(1024, 1024);

  //   const scene = new THREE.Scene();
  //   scene.background = new THREE.Color(0x000000);

  //   const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
  //   camera.position.set(0, 0, 1);

  //   const geometry = new THREE.PlaneGeometry(1, 1);
  //   const material = new THREE.ShaderMaterial({
  //     uniforms: {
  //       resolution: {
  //         value: new THREE.Vector2(1024, 1024),
  //       },
  //       time: { value: 0.0 },
  //     },
  //     vertexShader,
  //     fragmentShader,
  //   });

  //   const plane = new THREE.Mesh(geometry, material);
  //   plane.position.set(0.5, 0.5, 0);
  //   scene.add(plane);

  //   const texture = new THREE.Texture();
  //   texture.wrapS = THREE.RepeatWrapping;
  //   texture.wrapT = THREE.RepeatWrapping;
  //   scene.add(plane);

  //   const frameTexture = new THREE.WebGLRenderTarget(1024, 1024, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter });

  //   renderer.setRenderTarget(frameTexture);
  //   renderer.render(scene, camera);

  //   const buffer = new Uint8Array(1024 * 1024 * 4);
  //   renderer.readRenderTargetPixels(frameTexture, 0, 0, 1024, 1024, buffer);
  // }

  // public renderToTexture(vertexShader: string, fragmentShader: string, width: number, height: number): Uint8Array | null {
  //   const renderer = new THREE.WebGLRenderer();
  //   renderer.setPixelRatio(1);
  //   renderer.setSize(width, height);
  //   renderer.autoClear = false;

  //   const service: GlService = this;
  //   service.originalConsoleError = console.error.bind(renderer.getContext());

  //   console.error = function (summary, getError, programParamCode, programParam, programLogExample, programLog, vertexErrors, fragmentErrors) {
  //     service.hasIssue = true;
  //     return service.originalConsoleError(
  //       summary,
  //       getError,
  //       programParamCode,
  //       programParam,
  //       programLogExample,
  //       programLog,
  //       vertexErrors,
  //       fragmentErrors,
  //     );
  //   };

  //   const scene = new THREE.Scene();
  //   scene.background = new THREE.Color(0x000000);

  //   const camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0.1, 1000);
  //   camera.position.set(0, 0, 1);

  //   const geometry = new THREE.PlaneGeometry(1, 1);
  //   const material = new THREE.ShaderMaterial({
  //     uniforms: {
  //       resolution: {
  //         value: new THREE.Vector2(width, height),
  //       },
  //       time: { value: 0.0 },
  //     },
  //     vertexShader,
  //     fragmentShader,
  //   });

  //   const plane = new THREE.Mesh(geometry, material);
  //   plane.position.set(0.5, 0.5, 0);
  //   scene.add(plane);

  //   const frameTexture = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter });
  //   const buffer = new Uint8Array(width * height * 4);

  //   this.hasIssue = false;

  //   renderer.setRenderTarget(frameTexture);
  //   renderer.render(scene, camera);
  //   renderer.readRenderTargetPixels(frameTexture, 0, 0, width, height, buffer);

  //   console.error = this.originalConsoleError;

  //   return this.hasIssue ? null : buffer;
  // }
}

const glService = new GlService();
export default glService;
