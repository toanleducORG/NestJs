import { editFileName, imageFileFilter } from './file-upload-util';
import { diskStorage } from 'multer';
import { Options } from 'multer';

export const defaultOption: Options = {
  storage: diskStorage({
    destination: './upload/',
    filename: editFileName,
  }),
  fileFilter: imageFileFilter,
};
