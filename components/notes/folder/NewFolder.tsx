import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dispatch, SetStateAction } from "react";
import folderService from "../../../services/folderService";
import { useAppContext } from "@/hooks/AppContext";
import { useAuth } from "@/hooks/AuthContext";

type NewFolderModalProps = {
  setNewFolderName: Dispatch<SetStateAction<string>>;
  setNewFolderColor: Dispatch<SetStateAction<string>>;
  setShowNewFolderModal: Dispatch<SetStateAction<boolean>>;
  newFolderName: string;
  newFolderColor: string;
  colors: string[];
};

const NewFolderModal = ({
  setNewFolderColor,
  setNewFolderName,
  setShowNewFolderModal,
  newFolderName,
  newFolderColor,
  colors,
}: NewFolderModalProps) => {
  const { setIsRefetch } = useAppContext();
  const { user } = useAuth();
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      folderService.addFolder({
        name: newFolderName.trim(),
        color: newFolderColor,
        notes: [],
        userId: user?._id,
      });
      setNewFolderName("");
      setNewFolderColor("#3B82F6");
      setShowNewFolderModal(false);
      setIsRefetch(true);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Create New Folder</h3>
          <button
            title="close-create-folder-modal"
            onClick={() => setShowNewFolderModal(false)}
            className="close-create-folder-modal p-1 text-gray-400 hover:text-gray-600"
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
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
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
            {colors?.map((color: string) => (
              <button
                key={color}
                onClick={() => setNewFolderColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${newFolderColor === color ? "border-gray-800 ring-2 ring-offset-1 ring-gray-800" : "border-transparent hover:border-gray-400"}`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewFolderModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateFolder}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Create Folder
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewFolderModal;
