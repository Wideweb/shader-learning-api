export class Vec3 {
  public x: number;
  public y: number;
  public z: number;
}

export class GlCamera {
  public position: Vec3;
  public rotation: Vec3;

  public near: number;
  public far: number;

  public isOrthographic: boolean;

  public fov: number;

  public left: number;
  public right: number;
  public top: number;
  public bottom: number;
}

export class GlSceneObject {
  public position: Vec3;
  public rotation: Vec3;
  public scale: Vec3;
  public geometry: number;
}

export class GlScene {
  public camera: GlCamera;
  public objects: GlSceneObject[];

  public background: number;
  public antialias: boolean;
}
