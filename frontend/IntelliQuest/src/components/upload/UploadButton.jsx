const UploadButton = () => {
  const handleFileSelect = (e) => {
    const files = e.target.files;
    // Handle file selection
    console.log(files);
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <label className="btn btn-primary normal-case px-8 rounded-xl text-white">
        Select from computer
        <input
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.txt"
          multiple
        />
      </label>
      <span className="text-gray-500 text-sm">or drag & drop</span>
    </div>
  );
};

export default UploadButton;
