import amazonFileStorage from '@/services/amazonFileStorage';
import { NextFunction, Request, Response } from 'express';

class FileController {
  public get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buffer = amazonFileStorage.get(`Tasks/${req.params.id}`);
      res.status(200).send(buffer);
    } catch (error) {
      next(error);
    }
  };

  public uploadTemp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json(req.file?.filename);
    } catch (error) {
      next(error);
    }
  };

  public getImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buffer = await amazonFileStorage.get(`Images/${req.params.id}`);

      res.setHeader('Cross-Origin-Resource-Policy', '*');
      res.setHeader('Cross-Origin-Opener-Policy', '*');
      res.setHeader('Cross-Origin-Embedder-Policy', '*');
      res.writeHead(200, { 'Content-Type': 'image/*' });
      res.end(buffer);
    } catch (error) {
      next(error);
    }
  };
}

export default FileController;
