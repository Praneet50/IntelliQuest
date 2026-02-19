import DropZone from "./DropZone";
import UploadButton from "./UploadButton";
import UploadInfoNote from "./UploadInfoNote";

const UploadContainer = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          Step 1: Upload Source Material
        </h2>
        <p className="text-gray-400">
          Let's start by adding the content you want to generate questions
          <br />
          from. We support PDF, Word, and text files.
        </p>
      </div>

      <DropZone />
      <UploadButton />

      <div className="flex justify-center mt-8">
        <UploadInfoNote />
      </div>
    </div>
  );
};

export default UploadContainer;
