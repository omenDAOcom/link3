import axios from "axios";
import { useState } from "react";
import { Link } from "../../near/types";
import { useForm } from 'react-hook-form'
import { useNear } from "../../context/near"
// Components
import UploadImage from "../utils/upload_image";
import LabelAndErrors from "../utils/label_error";


const LinkForm = () => {
  const { addLink, isLoggedIn, accountId } = useNear()
  const { register, formState: { errors }, handleSubmit } = useForm()

  const [title, setTitle] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [uri, setUri] = useState<string | null>(null)
  const [image_uri, setImageUri] = useState<string | null>(null)
  const [tempImg, setTempImg] = useState<File | null>(null)


  const uploadToServer = async (image: File): Promise<string | null> => {
    try {
      const body = new FormData();
      body.append("file", image);
      const config = {
        headers: { 'content-type': 'multipart/form-data' },
        onUploadProgress: (event: any) => {
          console.log(`Current progress:`, Math.round((event.loaded * 100) / event.total));
        },
      };
      const response = await axios.post('/api/file', body, config);
      return response.data
    } catch (error) {
      console.error("uploadToServer", error)
      return null
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const { title, description, uri } = data
    const link: Link = { title, description, uri }
    if (tempImg) {
      const cid = await uploadToServer(tempImg)
      console.log("cid", cid)
      link.image_uri = cid
    }
    const result = await addLink(link);
    console.log("result", result);
  });

  const uriValidator = {
    required: { value: true, message: 'Uri is required' },
    minLength: { value: 3, message: 'Uri cannot be less than 3 character' },
  }
  const titleValidator = {
    required: { value: true, message: 'Title is required' },
    minLength: { value: 3, message: 'Title cannot be less than 3 character' },
  }
  const descriptionValidator = {
    required: { value: true, message: 'Description is required' },
    minLength: { value: 3, message: 'Description cannot be less than 3 character' },
  }

  return (
    <form
      className=" flex flex-col space-y-4 px-8 py-4 rounded max-w-2xl w-full bg-surface"
      onSubmit={handleSubmit(onSubmit as any)}
    >
      <div className="flex flex-col space-y-1">
        <LabelAndErrors title="Uri" error={errors.uri} />
        <input
          className='input input-text'
          id="uri"
          type="link"
          placeholder="https://www.google.com"
          {...register('uri', uriValidator)}
          onChange={(event) => setUri(event.target.value)}
        />
      </div>

      <div className="flex flex-col space-y-1">
        <LabelAndErrors title="Title" error={errors.title} />
        <input
          className='input input-text'
          id="title"
          type="text"
          placeholder="Google"
          {...register('title', titleValidator)}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="flex flex-col space-y-1">
        <LabelAndErrors title="Description" error={errors.description} />
        <input
          className='input input-text'
          id="description"
          type="text"
          placeholder="Search Engine"
          {...register('description', descriptionValidator)}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="flex flex-col">
        <label className="label">Image </label>
        <UploadImage setImage={setTempImg} />
      </div>

      <button type="submit" className="bg-primary text-on-primary px-4 py-2 rounded">
        <p>Create</p>
      </button>
    </form>
  )
}

export default LinkForm