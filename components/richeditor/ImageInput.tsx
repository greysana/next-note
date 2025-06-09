type ImageInputProps = {
    imageUrl: string;
    setImageUrl: (url: string) => void;
    onAddImage: () => void;
    onCancel: () => void;
    isVisible: boolean;
  };
  
  export const ImageInput = ({
    imageUrl,
    setImageUrl,
    onAddImage,
    onCancel,
    isVisible,
  }: ImageInputProps) => {
    if (!isVisible) return null;
  
    return (
  <div className="sticky bottom-[130px] left-1/2 -translate-x-1/2 max-w-[400px] p-4 bg-gray-50 rounded-lg border border-gray-300 shadow-sm gap-2">
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL"
          className="flex-1 p-2 border rounded mx-1"
        />
        <button
          onClick={onAddImage}
          className="bg-blue-500 cursor-pointer  text-white  mx-1 px-4 py-2 rounded"
          type="button"
        >
          Add Image
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-300 cursor-pointer px-4 py-2 m-1 rounded"
          type="button"
        >
          Cancel
        </button>
      </div>
    );
  };
  