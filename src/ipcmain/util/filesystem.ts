import * as fs from 'fs';

export function readFile(filePath:string) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });        
    }) 
}

export function saveFile(filePath:string, data:string) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, err => {
            if (err) {
                reject(err);
                return
            }
            resolve(data);
        });            
    }) 
}

export function exists(filePath:string) {
    return new Promise((resolve) => {
        fs.exists(filePath, (exists) => {
            resolve(exists);
        });
    })
}

export function createFolderIfNotExists(folderPath:string):Promise<void> {
    return new Promise((resolve, reject) => {
        exists(folderPath)
            .then(exists => {
                if (!exists) {
                    fs.mkdir(folderPath, mkdirErr => {
                        if (mkdirErr) {
                            reject(mkdirErr);
                        } else {
                            resolve(null);
                        }
                    });    
                } else {
                    resolve(null);
                }
            });
    });
}