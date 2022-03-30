import axios from "axios";
import { useState } from "react";
import { Link } from "../../near/types";
import { useForm } from 'react-hook-form'
import { useNear } from "../../context/near"
// Components
import UploadImage from "../utils/upload_image";
import LabelAndErrors from "../utils/label_error";
import { useEffect } from "react";
import { useToasts } from "react-toast-notifications";
import { NearLogo } from "../icons/near";

interface Props {
  cta: string;
  link?: Link
  onSubmitResolve?: () => void;
}

const LinkForm = ({ cta, link, onSubmitResolve }: Props) => {
  const { addToast } = useToasts();
  const { addLink, updateLink } = useNear()
  const { register, formState: { errors }, handleSubmit } = useForm()

  const [isReady, setIsReady] = useState<boolean>(false)
  const [isPending, setIsPending] = useState<boolean>(false)
  const [uri, setUri] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [imageUri, setImageCid] = useState<string>("")
  const [tempImg, setTempImg] = useState<File>(null)

  useEffect(() => {
    if (link) {
      setTitle(link.title)
      setDescription(link.description)
      setUri(link.uri)
      setImageCid(link.image_uri)
      setIsReady(true)
    }
    setIsReady(true)
  }, [link])

  const uploadImage = async (image: File): Promise<string | null> => {
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
      console.error("uploadImage", error)
      return null
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const { title, description, uri } = data
    const newLink: Link = { title, description, uri }
    try {
      setIsPending(true)
      if (tempImg) {
        const cid = await uploadImage(tempImg)
        newLink.image_uri = cid
      } else if (imageUri) {
        newLink.image_uri = imageUri
      }
      if (link && typeof link.id !== "undefined") {
        newLink.id = link.id
        await updateLink(newLink)
        addToast("Link updated", { appearance: 'success' });
      } else {
        await addLink(newLink);
        addToast("Link created", { appearance: 'success' });
      }
      setIsPending(false)
      onSubmitResolve()
    } catch (error) {
      setIsPending(false)
      console.error("onSubmit", error)
    }
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
    isReady && (
      <form
        className={` flex flex-col space-y-4 px-8 py-4 rounded max-w-2xl w-full bg-surface
        `}
        onSubmit={handleSubmit(onSubmit as any)}
      >
        <div className="flex flex-col space-y-1">
          <LabelAndErrors title="Uri" error={errors.uri} />
          <input
            className='input input-text'
            id="uri"
            type="link"
            placeholder="https://www.google.com"
            {...register('uri', { value: uri, onChange: (event) => setUri(event.target.value), ...uriValidator })}

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
            value={title}
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
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="label">Image </label>
          <UploadImage initialImage={imageUri ? `https://ipfs.io/ipfs/${imageUri}` : null} setImage={setTempImg} />
        </div>

        <button type="submit"
          className={`
          bg-primary text-on-primary px-4 py-2 rounded transition-smooth
          flex space-x-4 items-center justify-center
          ${isPending ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
        `}>
          <p>{cta}</p>
          <NearLogo className={`w-6 text-on-primary ${isPending ? "animate-spin" : ""}`} />
        </button>
      </form>
    )
  )
}

export default LinkForm