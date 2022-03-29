import formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';

const form = formidable({ multiples: true }); // multiples means req.files will be an array

type NextApiRequestWithFiles = NextApiRequest & {
	files: formidable.Files;
	file: any;
}

interface Props {
	req: NextApiRequestWithFiles,
	res: NextApiResponse
	next: any
}

export default async function parseMultipartForm(req: NextApiRequestWithFiles, res: NextApiResponse, next: any) {
	const contentType = req.headers['content-type']
	console.log("parseMultipartForm", contentType)
	if (contentType && contentType.indexOf('multipart/form-data') !== -1) {
		form.on('file', (name, file) => {
			req.file = file
		});
		form.parse(req, (err, fields, files) => {
			if (err) {
				console.log("err", err)
				res.status(400).send("")
			}
			req.body = fields; // sets the body field in the request object


			req.files = files; // sets the files field in the request object
			next(); // continues to the next middleware or to the route
		})
	} else {
		next();
	}
}