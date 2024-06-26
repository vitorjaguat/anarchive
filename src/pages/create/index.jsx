import React, { useRef, useState } from 'react';

export default function CreateIndex() {
  const [image, setImage] = useState(null);
  const [media, setMedia] = useState(null);
  const [showThumbnailInput, setShowThumbnailInput] = useState(false);
  const titleRef = useRef('');
  const descriptionRef = useRef('');
  const attToRef = useRef('');
  const attFromRef = useRef('');
  const attYearRef = useRef('');
  const attEventRef = useRef('');
  const attMediaRef = useRef('');
  const attCreatorRef = useRef('');
  const attTagsRef = useRef('');
  const attLocationRef = useRef('');

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
    const mimetype = file.type;
    if (!mimetype.includes('image')) {
      setShowThumbnailInput(true);
    }
    setMedia(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Create a new FormData object
    const formData = new FormData();

    // Append the image file to the FormData object
    formData.append('name', 'test');
    formData.append('title', titleRef.current.value);
    formData.append('description', descriptionRef.current.value);
    formData.append('attTo', attToRef.current.value);
    formData.append('attFrom', attFromRef.current.value);
    formData.append('attYear', attYearRef.current.value);
    formData.append('attEvent', attEventRef.current.value);
    formData.append('attMedia', attMediaRef.current.value);
    formData.append('attCreator', attCreatorRef.current.value);
    formData.append('attTags', attTagsRef.current.value);
    formData.append('attLocation', attLocationRef.current.value);

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
    <div className='w-screen h-screen overflow-y-scroll'>
      <div
        className='py-10 w-full min-h-screen flex items-center justify-center bg-slate-300'
        style={{ overflowY: 'scroll' }}
      >
        <div className='max-w-[1200px] min-w-[800px] h-fit bg-slate-400 p-6 rounded-sm text-black'>
          <div className='text-xl pb-6 w-full text-center'>
            Create your token
          </div>
          <div className=''>
            <form className='flex flex-col gap-10' onSubmit={handleSubmit}>
              <div className='flex justify-between items-center gap-3'>
                <label htmlFor='title'>Title:</label>
                <input
                  className='w-full px-4 py-3 rounded-lg outline-none font-thin'
                  ref={titleRef}
                  type='text'
                  id='title'
                  name='title'
                />
              </div>
              <div className='flex flex-col gap-1'>
                <label htmlFor='description'>Description:</label>
                <textarea
                  ref={descriptionRef}
                  type='text'
                  id='description'
                  name='description'
                  className='w-full h-60 px-4 py-3 rounded-lg outline-none font-thin'
                />
              </div>
              <div className='flex flex-col gap-1'>
                <label htmlFor='media'>Media:</label>
                <input
                  type='file'
                  onChange={handleMediaUpload}
                  name='media'
                  id='media'
                  className=''
                />
              </div>
              {showThumbnailInput && (
                <div className='flex flex-col gap-1'>
                  <label htmlFor='thumbnail'>Thumbnail image:</label>
                  <input
                    type='file'
                    onChange={handleImageUpload}
                    name='thumbnail'
                    id='thumbnail'
                    className=''
                  />
                </div>
              )}

              <div className='flex flex-col gap-1 mt-5'>
                <div className='font-bold tracking-widest w-full text-center'>
                  Attributes
                </div>
                <div className=''>
                  To:{' '}
                  <input
                    className='w-full px-4 py-3 rounded-lg outline-none font-thin'
                    ref={attToRef}
                    type='text'
                  />
                </div>
                <div className=''>
                  From:{' '}
                  <input
                    className='w-full px-4 py-3 rounded-lg outline-none font-thin'
                    ref={attFromRef}
                    type='text'
                  />
                </div>
                <div className=''>
                  Year:{' '}
                  <input
                    className='w-full px-4 py-3 rounded-lg outline-none font-thin'
                    ref={attYearRef}
                    type='text'
                  />
                </div>
                <div className=''>
                  Event:{' '}
                  <input
                    className='w-full px-4 py-3 rounded-lg outline-none font-thin'
                    ref={attEventRef}
                    type='text'
                  />
                </div>
                <div className=''>
                  Media:{' '}
                  <input
                    className='w-full px-4 py-3 rounded-lg outline-none font-thin'
                    ref={attMediaRef}
                    type='text'
                  />
                </div>
                <div className=''>
                  Creator:{' '}
                  <input
                    className='w-full px-4 py-3 rounded-lg outline-none font-thin'
                    ref={attCreatorRef}
                    type='text'
                  />
                </div>
                <div className=''>
                  Tags:{' '}
                  <input
                    className='w-full px-4 py-3 rounded-lg outline-none font-thin'
                    ref={attTagsRef}
                    type='text'
                  />
                </div>
                <div className=''>
                  Location:{' '}
                  <input
                    className='w-full px-4 py-3 rounded-lg outline-none font-thin'
                    ref={attLocationRef}
                    type='text'
                  />
                </div>
              </div>
              <div className=''>
                <button
                  className='bg-blue-200 w-full p-6 mt-3 text-lg text-black rounded-lg'
                  type='submit'
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
