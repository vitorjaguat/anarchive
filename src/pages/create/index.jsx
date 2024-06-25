import React, { useRef, useState } from 'react';

export default function CreateIndex() {
  const [image, setImage] = useState(null);
  const [media, setMedia] = useState(null);
  const titleRef = useRef('');

  const handleImageUpload = (event) => {
    // simple:
    const file = event.target.files[0];
    setImage(file);
    console.log('handleImageUpload done!');

    // base64:
    // const file = event.target.files[0];
    // const reader = new FileReader();
    // reader.onloadend = () => {
    //   setImage(reader.result);
    // };
    // reader.readAsDataURL(file);
    //In this code, readAsDataURL is used to start reading the contents of the specified Blob or File. When the read operation is finished, the onloadend event handler is called and the result attribute contains a data: URL representing the file's data as a base64 encoded string.
    // binary:
    // const file = event.target.files[0];
    // const reader = new FileReader();
    // reader.onloadend = () => {
    //   setImage(reader.result);
    // };
    // reader.readAsArrayBuffer(file);
  };

  const handleMediaUpload = (event) => {
    const file = event.target.files[0];
    setMedia(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Create a new FormData object
    const formData = new FormData();

    // Append the image file to the FormData object
    formData.append('name', 'test');
    formData.append('image', image);
    formData.append('media', media);
    try {
      // Send the FormData object as the request body
      const response = await fetch('/api/upload', {
        method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json',
        // },
        // body: JSON.stringify({ name: 'test', image }),
        body: formData,
      });

      // Handle the response from the API
      console.log('Response:', response);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className=''>
      <div className='text-xl'>Create your token</div>
      <div className=''>
        <form onSubmit={handleSubmit}>
          <div className=''>
            Image:
            <input type='file' onChange={handleImageUpload} />
          </div>
          <div className=''>
            Media:
            <input type='file' onChange={handleMediaUpload} />
          </div>
          <div className=''>
            <button
              className='bg-blue-200 p-3 mt-3 text-black rounded-lg'
              type='submit'
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
