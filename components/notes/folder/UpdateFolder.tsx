import { useAppContext } from "@/hooks/AppContext";
import folderService from "@/services/folderService";
import { Folder } from "@/types/note";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dispatch, SetStateAction } from "react";

type UpdateFolderModalProps = {
  setEditingFolder: Dispatch<SetStateAction<string>>;
  setEditedFolderName: Dispatch<SetStateAction<string>>;
  setEditedFolderColor: Dispatch<SetStateAction<string>>;
  setShowEditFolderModal: Dispatch<SetStateAction<boolean>>;
  editedFolderName: string;
  editedFolderColor: string;
  editingFolder: Folder;
  colors: string[];
};

const UpdateFolderModal = ({
  editedFolderName,
  editedFolderColor,
  editingFolder,
  colors,
  setEditingFolder,
  setEditedFolderName,
  setEditedFolderColor,
  setShowEditFolderModal,
}: UpdateFolderModalProps) => {
  const { setIsRefetch } = useAppContext();

  const handleUpdateFolder = () => {
    if (editingFolder && editedFolderName.trim()) {
      folderService.updateFolder(editingFolder._id, {
        name: editedFolderName.trim(),
        color: editedFolderColor,
      });
      setShowEditFolderModal(false);
      setEditingFolder("");
      setIsRefetch(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Edit Folder</h3>
          <button
            onClick={() => setShowEditFolderModal(false)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Folder Name
          </label>
          <input
            type="text"
            value={editedFolderName}
            onChange={(e) => setEditedFolderName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter folder name"
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setEditedFolderColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${editedFolderColor === color ? "border-gray-800 ring-2 ring-offset-1 ring-gray-800" : "border-transparent hover:border-gray-400"}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowEditFolderModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateFolder}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateFolderModal;
