import { useRef, useState } from "react"

interface Props {
  setImage: (image: File) => void
}
const UploadFile = (props: Props) => {

  const { setImage } = props
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const inputImage = useRef<HTMLInputElement>(null);


  const dropHandler = (event: any) => {
    event.preventDefault()
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0]
      if (file) {
        setImage(file)
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = (event: any) => setImage(event.target.result)
        setImageUrl(URL.createObjectURL(file))
      }
    }
  }
  const pickImage = (event: any) => {
    event.preventDefault()
    if (inputImage && inputImage.current) {
      inputImage.current.click()
    }
  }
  const dragOverHandler = (event: any) => event.preventDefault()

  const addFile = (event: any) => {
    event.preventDefault()
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setImage(file)
      setImageUrl(URL.createObjectURL(file))
    }
  }



  return (<>
    <div>
      <div
        id="drop_zone"
        onDrop={dropHandler}
        onDragOver={dragOverHandler}
        onClick={pickImage}
        className="
            flex
            justify-center
            items-center
            clickable
            text-on-surface
            h-56
            shadow-md
          "
      >
        {imageUrl ? (
          <img className="h-full object-cover object-center " src={imageUrl} alt="image" />
        ) : (
          <span className="text-on-surface"> Drag and drop image here </span>
        )}
      </div>
      <input
        accept="image/*"
        className="hidden"
        type="file"
        ref={inputImage}
        onChange={addFile}
      />
    </div>
  </>)
}

export default UploadFile