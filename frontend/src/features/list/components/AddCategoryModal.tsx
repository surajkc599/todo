import { Task } from '../../../shared/types';
import { AddGroupForm } from './AddGroupForm';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: Task) => void;
  onError?: (message: string) => void;
}

export function AddCategoryModal({ isOpen, onClose, onSuccess, onError }: AddCategoryModalProps) {
  if (!isOpen) return null;

  const handleSuccess = (data: Task) => {
    onSuccess(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">New Category</h2>

          <AddGroupForm
            onSuccess={handleSuccess}
            onError={onError}
            onCancel={onClose}
            showCancel={true}
          />
        </div>
      </div>
    </div>
  );
}
