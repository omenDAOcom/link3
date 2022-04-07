import axios from "axios";
import { HubDto } from "../../near/types";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNear } from "../../context/near";
import { useToasts } from "react-toast-notifications";
// Components
import { NearLogo } from "../icons/near";
import UploadImage from "../utils/upload_image";
import LabelAndErrors from "../utils/label_error";

interface Props {
  cta: string;
  hub?: HubDto;
  onSubmitResolve?: () => void;
}

const HubForm = ({ cta, hub, onSubmitResolve }: Props) => {
  const { addToast } = useToasts();
  const { createHub, updateHub } = useNear();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const [isReady, setIsReady] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [image_uri, setImageUri] = useState<string | null>(null);
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (hub) {
      setTitle(hub.title);
      setDescription(hub.description);
      if (hub.image_uri) {
        setImageUri(hub.image_uri);
      }
    }
    setIsReady(true);
  }, [hub]);

  useEffect(() => {
    if (localImageFile) {
      setIsDirty(true);
    }
  }, [localImageFile]);

  const uploadImage = async (image: File): Promise<string | null> => {
    try {
      const body = new FormData();
      body.append("file", image);
      const config = {
        headers: { "content-type": "multipart/form-data" },
        onUploadProgress: (event: any) => {
          console.log(
            `Current progress:`,
            Math.round((event.loaded * 100) / event.total)
          );
        },
      };
      const response = await axios.post("/api/file", body, config);
      return response.data;
    } catch (error) {
      console.error("uploadImage", error);
      return null;
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const { title, description } = data;
    const hub: HubDto = { title, description };
    try {
      setIsPending(true);
      if (localImageFile) {
        const cid = await uploadImage(localImageFile);
        hub.image_uri = cid;
      }
      if (cta === "create") {
        await createHub(hub);
        addToast("Hub created", { appearance: "success" });
      } else {
        await updateHub(hub);
        addToast("Hub updated", { appearance: "success" });
      }

      setIsPending(false);
      if (onSubmitResolve) {
        onSubmitResolve();
      }
    } catch (error) {
      console.log("Edit Hub onSubmit error:", error);
    }
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    switch (name) {
      case "title":
        setTitle(value);
        break;
      case "description":
        setDescription(value);
        break;
      default:
        console.log("Unknow on change:", name, value);
        break;
    }

    setIsDirty(true);
  };

  const titleValidator = {
    required: { value: true, message: "Title is required" },
    minLength: { value: 3, message: "Title cannot be less than 3 character" },
    maxLength: { value: 20, message: "Title cannot be more than 20 character" },
  };

  const descriptionValidator = {
    required: { value: true, message: "Description is required" },
    minLength: {
      value: 3,
      message: "Description cannot be less than 3 character",
    },
    maxLength: {
      value: 200,
      message: "Description cannot be more than 200 character",
    },
  };

  return (
    <>
      {isReady && (
        <form
          className=" flex flex-col space-y-4 px-8 py-4 rounded max-w-2xl w-full bg-surface"
          onSubmit={handleSubmit(onSubmit as any)}
        >
          <div className="flex flex-col space-y-1">
            <LabelAndErrors title="Title" error={errors.title} />
            <input
              className="input input-text"
              id="title"
              type="text"
              placeholder="John Doe"
              {...register("title", {
                onChange,
                value: title,
                ...titleValidator,
              })}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <LabelAndErrors title="Description" error={errors.description} />
            <input
              className="input input-text"
              id="description"
              type="text"
              placeholder="Tell us about you"
              {...register("description", {
                onChange,
                value: description,
                ...descriptionValidator,
              })}
            />
          </div>

          <div className="flex flex-col">
            <label className="label">Image </label>
            <UploadImage
              setImage={setLocalImageFile}
              initialImage={
                image_uri ? `https://ipfs.io/ipfs/${image_uri}` : null
              }
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={` bg-primary text-on-primary px-4 py-2 rounded transition-smooth flex space-x-4 items-center justify-center
             ${
               isPending || !isDirty
                 ? "opacity-50 cursor-not-allowed"
                 : "opacity-100"
             }
            `}
          >
            <p>{cta}</p>
            <NearLogo
              className={`w-6 text-on-primary ${
                isPending ? "animate-spin" : ""
              }`}
            />
          </button>
        </form>
      )}
    </>
  );
};

export default HubForm;
