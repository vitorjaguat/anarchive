import { useRef, useState, useEffect } from 'react';
import createToken from '../../utils/createToken';
import PayoutSplits from '../../components/create/PayoutSplits';
import MintStart from '../../components/create/MintStart';
import EditionSize from '../../components/create/EditionSize';
import { useAccount } from 'wagmi';
import { greenlistedAccounts } from '../../utils/greenlistedAccounts';
import Link from 'next/link';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useStorageUpload } from '@thirdweb-dev/react';
import Head from 'next/head';

export default function CreateIndex() {
  const { isConnected, address } = useAccount();
  const [image, setImage] = useState(null);
  const [media, setMedia] = useState(null);
  const [showThumbnailInput, setShowThumbnailInput] = useState(false);
  const [validationError, setValidationError] = useState({});
  const [mediaPreview, setMediaPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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
  const priceRef = useRef('');
  const mintingDurationRef = useRef('');
  const [payoutRecipients, setPayoutRecipients] = useState('me');
  const [editionSize, setEditionSize] = useState(
    BigInt('18446744073709551615')
  );
  const [processingSubmit, setProcessingSubmit] = useState('initial');
  const [submitMessage, setSubmitMessage] = useState('Create fragment');
  //fixing hydration error:
  const [isMounted, setIsMounted] = useState(false);
  const { mutateAsync: upload } = useStorageUpload();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleImageUpload = (event) => {
    setImagePreview(null);

    const file = event.target.files[0];
    const mimetype = file?.type;

    // if media is an image, show ImagePreview
    if (mimetype?.includes('image')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }

    setImage(file);
  };

  const handleMediaUpload = (event) => {
    setMediaPreview(null);
    setShowThumbnailInput(false);
    const file = event.target.files[0];

    //check is file.type is image and show Thumbnail input:
    const mimetype = file?.type;
    if (!mimetype?.includes('image')) {
      setShowThumbnailInput(true);
    }

    // if media is an image, show MediaPreview
    if (mimetype?.includes('image') || mimetype?.includes('video')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }

    setMedia(file);
  };

  const checkValidation = (field) => {
    let error = { ...validationError };
    delete error.all;
    switch (field) {
      case 'title':
        if (titleRef.current.value.length < 1) {
          error.title = 'Title is required!';
        } else if (titleRef.current.value.length > 200) {
          error.title = 'Title is too long! Max 200 characters.';
        } else {
          error = { ...error };
          delete error.title;
        }
        break;
      case 'description':
        if (descriptionRef.current.value.length < 1) {
          error.description =
            "Description is required. Here you can describe your fragment, what it is about, what it represents, etc. Remember the description is part of your fragment's metadata.";
        } else {
          error = { ...error };
          delete error.description;
        }
        break;
      case 'attTo':
        if (attToRef.current.value.length < 1) {
          error.attTo =
            'Attribute "To" is required. Tell us who/which organization this fragment is dedicated to. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attToRef.current.value.length > 120) {
          error.attTo = 'Attibute "To" is too long! Max 120 characters.';
        } else {
          error = { ...error };
          delete error.attTo;
        }
        break;
      case 'attFrom':
        if (attFromRef.current.value.length < 1) {
          error.attFrom =
            'Attribute "From" is required. Tell us who/which organization this fragment is coming from. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attFromRef.current.value.length > 120) {
          error.attFrom = 'Attribute "From" is too long! Max 120 characters.';
        } else {
          error = { ...error };
          delete error.attFrom;
        }
        break;
      case 'attYear':
        if (attYearRef.current.value.length === 4) {
          delete error.attYear;
          const valErrObj = validationError;
          delete valErrObj.attYear;
          setValidationError(valErrObj);
          break;
        } else if (attYearRef.current.value.length < 1) {
          error.attYear =
            'Attribute "Year" is required. Tell us the year this fragment was created. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (
          attYearRef.current.value.length > 1 &&
          attYearRef.current.value.length < 4
        ) {
          error.attYear =
            'Attribute "Year" is too short! It must be 4 characters long.';
        } else if (attYearRef.current.value.length > 4) {
          error.attYear = 'Attribute "Year" is too long! Max 4 characters.';
        } else if (isNaN(attYearRef.current.value)) {
          error.attYear = 'Attribute "Year" must be a number.';
        }
        break;
      case 'attEvent':
        if (attEventRef.current.value.length < 1) {
          error.attEvent =
            'Attribute "Event" is required. Tell us the event this fragment is related to. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attEventRef.current.value.length > 120) {
          error.attEvent = 'Attribute "Event" is too long! Max 120 characters.';
        } else {
          error = { ...error };
          delete error.attEvent;
        }
        break;
      case 'attMedia':
        if (attMediaRef.current.value === '') {
          error.attMedia =
            'Attribute "Media" is required. Please select the media type this fragment is related to. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attMediaRef.current.value.length > 120) {
          error.attMedia = 'Attribute "Media" is too long! Max 120 characters.';
        } else {
          error = { ...error };
          delete error.attMedia;
        }
        break;
      case 'attCreator':
        if (attCreatorRef.current.value.length < 1) {
          error.attCreator =
            'Attribute "Creator" is required. Tell us the creator of this fragment. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attCreatorRef.current.value.length > 120) {
          error.attCreator =
            'Attribute "Creator" is too long! Max 120 characters.';
        } else {
          error = { ...error };
          delete error.attCreator;
        }
        break;
      case 'attTags':
        if (attTagsRef.current.value.length < 1) {
          error.attTags =
            'Attribute "Tags" is required. Pick up some tags that describe the content or nature of this fragment. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attTagsRef.current.value.length > 200) {
          error.attTags = 'Attribute "Tags" is too long! Max 200 characters.';
        } else {
          error = { ...error };
          delete error.attTags;
        }
        break;
      case 'attLocation':
        if (attLocationRef.current.value.length < 1) {
          error.attLocation =
            'Attribute "Location" is required. Tell us the location this fragment is related to. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attLocationRef.current.value.length > 120) {
          error.attLocation =
            'Attribute "Location" is too long! Max 120 characters.';
        } else {
          error = { ...error };
          delete error.attLocation;
        }
        break;
      case 'all':
        if (titleRef.current.value.length < 1) {
          error.title = 'Title is required!';
        } else if (titleRef.current.value.length > 200) {
          error.title = 'Title is too long! Max 200 characters.';
        } else {
          error = { ...error };
          delete error.title;
        }
        if (descriptionRef.current.value.length < 1) {
          error.description =
            "Description is required. Here you can describe your fragment, what it is about, what it represents, etc. Remember the description is part of your fragment's metadata.";
        } else {
          error = { ...error };
          delete error.description;
        }
        if (attToRef.current.value.length < 1) {
          error.attTo =
            'Attribute "To" is required. Tell us who/which organization this fragment is dedicated to. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attToRef.current.value.length > 120) {
          error.attTo = 'Attibute "To" is too long! Max 120 characters.';
        } else {
          error = { ...error };
          delete error.attTo;
        }
        if (attFromRef.current.value.length < 1) {
          error.attFrom =
            'Attribute "From" is required. Tell us who/which organization this fragment is coming from. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attFromRef.current.value.length > 120) {
          error.attFrom = 'Attribute "From" is too long! Max 120 characters.';
        } else {
          error = { ...error };
          delete error.attFrom;
        }
        if (attYearRef.current.value.length === 4) {
          delete error.attYear;
          const valErrObj = validationError;
          delete valErrObj.attYear;
          setValidationError(valErrObj);
          break;
        } else if (attYearRef.current.value.length < 1) {
          error.attYear =
            'Attribute "Year" is required. Tell us the year this fragment was created. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (
          attYearRef.current.value.length > 1 &&
          attYearRef.current.value.length < 4
        ) {
          error.attYear =
            'Attribute "Year" is too short! It must be 4 characters long.';
        } else if (attYearRef.current.value.length > 4) {
          error.attYear = 'Attribute "Year" is too long! Max 4 characters.';
        } else if (isNaN(attYearRef.current.value)) {
          error.attYear = 'Attribute "Year" must be a number.';
        }
        if (attEventRef.current.value.length < 1) {
          error.attEvent =
            'Attribute "Event" is required. Tell us the event this fragment is related to. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attEventRef.current.value.length > 120) {
          error.attEvent = 'Attribute "Event" is too long! Max 120 characters.';
        } else {
          error = { ...error };
          delete error.attEvent;
        }
        if (attMediaRef.current.value === '') {
          error.attMedia =
            'Attribute "Media" is required. Please select the media type this fragment is related to. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attMediaRef.current.value.length > 120) {
          error.attMedia = 'Attribute "Media" is too long! Max 120 characters.';
        } else {
          error = { ...error };
          delete error.attMedia;
        }
        if (attCreatorRef.current.value.length < 1) {
          error.attCreator =
            'Attribute "Creator" is required. Tell us the creator of this fragment. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attCreatorRef.current.value.length > 120) {
          error.attCreator =
            'Attribute "Creator" is too long! Max 120 characters.';
        } else {
          error = { ...error };
          delete error.attCreator;
        }
        if (attTagsRef.current.value.length < 1) {
          error.attTags =
            'Attribute "Tags" is required. Pick up some tags that describe the content or nature of this fragment. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attTagsRef.current.value.length > 200) {
          error.attTags = 'Attribute "Tags" is too long! Max 200 characters.';
        } else {
          error = { ...error };
          delete error.attTags;
        }
        if (attLocationRef.current.value.length < 1) {
          error.attLocation =
            'Attribute "Location" is required. Tell us the location this fragment is related to. This information is important for the generation of The Anarchiving Game data visualizations.';
        } else if (attLocationRef.current.value.length > 120) {
          error.attLocation =
            'Attribute "Location" is too long! Max 120 characters.';
        } else {
          error = { ...error };
          delete error.attLocation;
        }
        return error;
      default:
        break;
    }
    setValidationError({ ...error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //Validations:
    const errorsInValidation = checkValidation('all');
    console.log('errorsInValidation', errorsInValidation);
    if (errorsInValidation && Object.keys(errorsInValidation).length > 0) {
      setValidationError({
        ...errorsInValidation,
        all: 'Please check the form for errors before submitting.',
      });
      return;
    }

    //Change state of Submit button:
    setProcessingSubmit('processing');
    setSubmitMessage(
      'Please wait. When prompted, please accept transaction(s) on your wallet.'
    );

    // Create a new FormData object
    const formData = new FormData();

    const name = titleRef.current.value;
    const description = descriptionRef.current.value;
    const attTo = attToRef.current.value;
    const attFrom = attFromRef.current.value;
    const attYear = attYearRef.current.value;
    const attEvent = attEventRef.current.value;
    const attMedia = attMediaRef.current.value;
    const attCreator = attCreatorRef.current.value;
    const attTags = attTagsRef.current.value;
    const attLocation = attLocationRef.current.value;

    let finalResponse;

    try {
      //upload media:
      let mediaUri = '';
      let imageUri = '';
      let metadataUri = '';
      if (media) {
        const mediaUriData = await upload({ data: [media] });
        mediaUri = mediaUriData[0];
      }

      // check if media mediatype is image:
      const isTypeImage = media?.type?.includes('image');
      console.log('isTypeImage', isTypeImage);

      // upload image:
      if (!isTypeImage && image) {
        const imageUriData = await upload({ data: [image] });
        imageUri = imageUriData[0];
      }
      console.log('mediaUri', mediaUri);
      console.log('imageUri', imageUri);

      //construct metadata object:
      const metadataObj = {
        name: name,
        description: description,
        image: isTypeImage ? mediaUri : imageUri,
        content: {
          mime: media?.type,
          uri: mediaUri,
        },
        animation_url: !isTypeImage ? mediaUri : undefined,
        attributes: [
          {
            trait_type: 'To',
            value: attTo,
          },
          {
            trait_type: 'From',
            value: attFrom,
          },
          {
            trait_type: 'Year',
            value: attYear,
          },
          {
            trait_type: 'Event',
            value: attEvent,
          },
          {
            trait_type: 'Media',
            value: attMedia,
          },
          {
            trait_type: 'Creator',
            value: attCreator,
          },
          {
            trait_type: 'Tags',
            value: attTags,
          },
          {
            trait_type: 'Location',
            value: attLocation,
          },
        ],
      };
      if (isTypeImage) {
        delete metadataObj.animation_url;
      }

      //upload metadata:
      const metadata = JSON.stringify(metadataObj);
      const metadataUriData = await upload({ data: [metadata] });
      metadataUri = metadataUriData[0];
      console.log('metadataUri', metadataUri);

      // Get sales config options:
      // price:
      let price;
      if (priceRef.current.value === '') {
        price = '0';
      } else {
        price = priceRef.current.value.toString();
      }

      //mintingDuration:
      // const mintingDuration = mintingDurationRef.current.value;
      const mintingDuration = null;

      //payoutRecipients:
      const payoutRecipient = payoutRecipients;

      finalResponse = await createToken(
        metadataUri,
        price,
        mintingDuration,
        payoutRecipient,
        editionSize
      );
      console.log('finalResponse:', finalResponse);
      if (finalResponse && finalResponse?.hash) {
        setProcessingSubmit('success');
        setSubmitMessage(
          'Successfully created token. Hash: ' + finalResponse.hash
        );
      }
      if (finalResponse && finalResponse?.error) {
        setProcessingSubmit('error');
        setSubmitMessage('Transaction has failed.');
        return;
      }
    } catch (error) {
      console.error('Error handleSubmit on /create:', error);
      setProcessingSubmit('error');
      setSubmitMessage('Something went wrong.');
      if (error) return;
    }

    // Reset form:
    titleRef.current.value = '';
    descriptionRef.current.value = '';
    attToRef.current.value = '';
    attFromRef.current.value = '';
    attYearRef.current.value = '';
    attEventRef.current.value = '';
    attMediaRef.current.value = '';
    attCreatorRef.current.value = '';
    attTagsRef.current.value = '';
    attLocationRef.current.value = '';
    setImage(null);
    setMedia(null);
    priceRef.current.value = '0';
  };

  // console.log('editionSize:', editionSize);
  // console.log('address:', address);

  // if (!greenlistedAccounts.includes(address?.toLowerCase())) {

  if (
    !greenlistedAccounts.find(
      (addr) => addr.toLowerCase() === address?.toLowerCase()
    )
  ) {
    return (
      <div className='relative h-screen w-screen flex items-center justify-center'>
        {/* video bg: */}
        <div className='absolute opacity-40 object-cover w-full h-full z-0'>
          <video
            className='w-full h-full object-cover'
            autoPlay
            muted
            src='/assets/tag_bg.mp4'
            loop
            playsInline
          />
        </div>
        {/* back btns */}
        <Link
          href='/'
          className='absolute top-3 left-3 w-[34px] h-[34px] rounded-md bg-white/20 flex items-center justify-center z-20'
        >
          <IoIosArrowRoundBack color='white' size={30} className='opacity-80' />
        </Link>

        {/* content: */}
        {isConnected && (
          <div className='p-10 bg-black/40 flex flex-col gap-7 max-w-[700px] justify-center items-center z-10'>
            <div className='text-center'>
              It seems that your wallet is not{' '}
              <span className='text-[#11ff20]'>greenlisted</span> as a creator
              within The Anarchiving Game smart contract yet. To start your
              journey as an Anarchivist, you must join our guild. Just follow
              the instructions:{' '}
            </div>
            <div className='text-[#11ff20] text-xl animate-pulse hover:animate-none hover:scale-105 duration-300 ease-in-out'>
              <a
                href='https://guild.xyz/anarchiving'
                target='_blank'
                rel='noopener noreferrer'
              >
                https://guild.xyz/anarchiving
              </a>
            </div>
            <div className=''>
              Or, if you just want to test out our new token creation page,{' '}
              <Link
                className='text-indigo-400 hover:text-indigo-300 animate-pulse hover:animate-none hover:scale-105 duration-300 ease-in-out'
                href='/create-test'
              >
                click here!
              </Link>
            </div>
          </div>
        )}
        {!isConnected && (
          <div className='p-10 bg-black/40 flex flex-col gap-7 max-w-[700px] justify-center items-center z-10'>
            <div className='text-center'>
              In order to create a token, you must connect your wallet first.
              Then, if you are a{' '}
              <span className='text-[#11ff20]'>greenlisted</span> creator, you
              will be automatically redirected to the creation page.
            </div>
            <div className='text-[#11ff20] text-base animate-pulse hover:animate-none hover:scale-105 duration-300 ease-in-out'>
              <ConnectButton label='Please Connect' />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Create Fragment | The Anarchiving Game</title>
      </Head>
      <div className='relative w-screen h-screen overflow-y-auto'>
        {/* video bg: */}
        <div className='fixed top-0 left-0 opacity-40 object-cover w-screen h-screen z-0'>
          <video
            className='w-full h-full object-cover'
            autoPlay
            muted
            src='/assets/tag_bg.mp4'
            loop
            playsInline
          />
        </div>

        {/* back btn */}
        <Link
          href='/'
          className='absolute top-3 left-3 w-[34px] h-[34px] flex items-center justify-center rounded-md bg-white/20 z-20'
        >
          <IoIosArrowRoundBack
            size={31}
            className='opacity-80 text-sph-purple-light'
          />
        </Link>

        {/* content: */}
        <div className='absolute py-20 w-full min-h-screen flex items-center justify-center bg-black/10 z-10'>
          <div className='max-w-[95%] md:max-w-[1200px] md:min-w-[800px] h-fit bg-indigo-400/80 p-2 md:p-6 rounded-md text-black'>
            <div className='pt-20 pb-16 text-2xl md:text-3xl w-full text-center font-bold  animate-bounce'>
              <div className=' tracking-wider text-slate-900'>
                Create your fragment
              </div>
            </div>
            <div className=''>
              <form className='flex flex-col gap-10' onSubmit={handleSubmit}>
                <div className='flex flex-col justify-between gap-1'>
                  <label htmlFor='title'>Title:</label>
                  <input
                    className='w-full px-4 py-3 rounded-lg outline-none font-thin bg-slate-800 text-slate-200'
                    ref={titleRef}
                    type='text'
                    id='title'
                    name='title'
                    onChange={() => checkValidation('title')}
                  />
                  {validationError?.title && (
                    <div className='text-orange-700 text-sm'>
                      {validationError.title}
                    </div>
                  )}
                </div>
                <div className='flex flex-col gap-1'>
                  <label htmlFor='description'>Description:</label>
                  <textarea
                    ref={descriptionRef}
                    type='text'
                    id='description'
                    name='description'
                    className='w-full h-60 px-4 py-3 rounded-lg outline-none font-thin  bg-slate-800 text-slate-200'
                    onChange={() => checkValidation('description')}
                  />
                  {validationError?.description && (
                    <div className='text-orange-700 text-sm max-w-[700px]'>
                      {validationError.description}
                    </div>
                  )}
                </div>
                <div className='flex flex-col gap-1'>
                  <label htmlFor='media'>
                    <div className=''>Media:</div>
                    <div className='text-sm text-black/80'>
                      This is the media file of your token. Media type can be
                      JPG, PNG, GIF, MP3, MP4, PDF, HTML etc.
                    </div>
                  </label>
                  <input
                    type='file'
                    onChange={handleMediaUpload}
                    name='media'
                    id='media'
                    className=''
                    accept='.jpg, .jpeg, .png, .mp4, .pdf, .html, .mpeg, .wav, .mp3, .ogg, .gif'
                    // TODO: add accept attribute to accept only certain file types
                  />
                  {mediaPreview && mediaPreview?.includes('image') && (
                    <div className='mt-2 w-full max-w-[700px] h-fit bg-slate-300 flex items-center justify-center rounded-lg '>
                      <img
                        src={mediaPreview}
                        alt='preview'
                        className='w-full p-3 h-full object-cover'
                      />
                    </div>
                  )}
                  {mediaPreview && mediaPreview?.includes('video') && (
                    <div className='mt-2 w-full max-w-[600px] h-fit bg-slate-300 flex items-center justify-center rounded-lg '>
                      <video
                        src={mediaPreview}
                        className='w-full p-3 h-full object-cover'
                        autoPlay
                        loop
                        playsInline
                      />
                    </div>
                  )}
                </div>
                {showThumbnailInput && (
                  <div className='flex flex-col gap-1'>
                    <label htmlFor='thumbnail'>
                      <div className=''>Thumbnail image:</div>
                      <div className='text-sm text-black/80'>
                        This is the thumbnail image of your token. Please upload
                        an image file (JPG, PNG, etc.)
                      </div>
                    </label>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageUpload}
                      name='thumbnail'
                      id='thumbnail'
                      className=''
                    />
                    {imagePreview && (
                      <div className='w-full max-w-[400px] h-fit bg-slate-300 flex items-center justify-center rounded-lg '>
                        <img
                          src={imagePreview}
                          alt='preview'
                          className='w-full p-3 h-full object-cover'
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className='flex flex-col gap-2 mt-5'>
                  <div className='font-bold tracking-widest w-full text-center text-xl'>
                    Attributes
                  </div>
                  <div className=''>
                    <label htmlFor='attTo'>To: </label>
                    <input
                      className='w-full px-4 py-3 rounded-lg outline-none font-thin  bg-slate-800 text-slate-200'
                      ref={attToRef}
                      type='text'
                      id='attTo'
                      name='attTo'
                      onChange={() => checkValidation('attTo')}
                    />
                    {validationError?.attTo && (
                      <div className='text-orange-700 text-sm max-w-[700px] mb-2'>
                        {validationError.attTo}
                      </div>
                    )}
                  </div>
                  <div className=''>
                    <label htmlFor='attFrom'>From: </label>
                    <input
                      className='w-full px-4 py-3 rounded-lg outline-none font-thin  bg-slate-800 text-slate-200'
                      ref={attFromRef}
                      type='text'
                      id='attFrom'
                      name='attFrom'
                      onChange={() => checkValidation('attFrom')}
                    />
                    {validationError?.attFrom && (
                      <div className='text-orange-700 text-sm max-w-[700px] mb-2'>
                        {validationError.attFrom}
                      </div>
                    )}
                  </div>
                  <div className=''>
                    <label htmlFor='attYear'>Year: </label>
                    <input
                      className='w-full px-4 py-3 rounded-lg outline-none font-thin bg-slate-800 text-slate-200'
                      ref={attYearRef}
                      type='number'
                      min={1900}
                      max={2099}
                      id='attYear'
                      name='attYear'
                      onChange={() => checkValidation('attYear')}
                    />
                    {validationError?.attYear && (
                      <div className='text-orange-700 text-sm max-w-[700px] mb-2'>
                        {validationError.attYear}
                      </div>
                    )}
                  </div>
                  <div className=''>
                    <label htmlFor='attEvent'>Event: </label>
                    <input
                      className='w-full px-4 py-3 rounded-lg outline-none font-thin bg-slate-800 text-slate-200'
                      ref={attEventRef}
                      type='text'
                      id='attEvent'
                      name='attEvent'
                      onChange={() => checkValidation('attEvent')}
                    />
                    {validationError?.attEvent && (
                      <div className='text-orange-700 text-sm max-w-[700px] mb-2'>
                        {validationError.attEvent}
                      </div>
                    )}
                  </div>
                  <div className=''>
                    <label htmlFor='attMedia'>Media: </label>
                    <div className='relative w-full'>
                      <select
                        className='w-full px-2 md:px-4 py-3 pr-10 rounded-lg outline-none font-thin bg-slate-800 text-slate-200 appearance-none'
                        ref={attMediaRef}
                        id='attMedia'
                        name='attMedia'
                        defaultValue={''}
                        onChange={() => checkValidation('attMedia')}
                      >
                        <option value=''>Select media type...</option>
                        <option value='Audio'>Audio</option>
                        <option value='Code'>Code</option>
                        <option value='Image'>Image</option>
                        <option value='Note'>Note</option>
                        <option value='Slide'>Slide</option>
                        <option value='Text'>Text</option>
                        <option value='Video'>Video</option>
                      </select>
                      {/* Custom arrow */}
                      <div className='pointer-events-none absolute inset-y-0 right-2 md:right-4 flex items-center'>
                        <svg
                          className='w-4 h-4 text-slate-200'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                          viewBox='0 0 24 24'
                        >
                          <path d='M19 9l-7 7-7-7' />
                        </svg>
                      </div>
                    </div>
                    {validationError?.attMedia && (
                      <div className='text-orange-700 text-sm max-w-[700px] mb-2'>
                        {validationError.attMedia}
                      </div>
                    )}
                  </div>
                  <div className=''>
                    <label htmlFor='attCreator'>Creator: </label>
                    <input
                      className='w-full px-4 py-3 rounded-lg outline-none font-thin bg-slate-800 text-slate-200'
                      ref={attCreatorRef}
                      type='text'
                      id='attCreator'
                      name='attCreator'
                      onChange={() => checkValidation('attCreator')}
                    />
                    {validationError?.attCreator && (
                      <div className='text-orange-700 text-sm max-w-[700px] mb-2'>
                        {validationError.attCreator}
                      </div>
                    )}
                  </div>
                  <div className=''>
                    <label htmlFor='attTags'>Tags: </label>
                    <input
                      className='w-full px-4 py-3 rounded-lg outline-none font-thin bg-slate-800 text-slate-200'
                      ref={attTagsRef}
                      type='text'
                      id='attTags'
                      name='attTags'
                      onChange={() => checkValidation('attTags')}
                    />
                    {validationError?.attTags && (
                      <div className='text-orange-700 text-sm max-w-[700px] mb-2'>
                        {validationError.attTags}
                      </div>
                    )}
                  </div>
                  <div className=''>
                    <label htmlFor='attLocation'>Location: </label>
                    <input
                      className='w-full px-4 py-3 rounded-lg outline-none font-thin bg-slate-800 text-slate-200'
                      ref={attLocationRef}
                      type='text'
                      id='attLocation'
                      name='attLocation'
                      onChange={() => checkValidation('attLocation')}
                    />
                    {validationError?.attLocation && (
                      <div className='text-orange-700 text-sm max-w-[700px] mb-2'>
                        {validationError.attLocation}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sales config: */}
                <div className='flex flex-col gap-2 mt-5'>
                  {/* Price */}
                  <div className=''>
                    <label htmlFor='price'>Price (ETH): </label>
                    <input
                      className='w-full px-4 py-3 rounded-lg outline-none font-thin bg-slate-800 text-slate-200'
                      ref={priceRef}
                      type='number'
                      id='price'
                      name='price'
                      defaultValue='0'
                      step={0.000001}
                      onChange={() => {
                        // console.log(priceRef.current.value);
                      }}
                    />
                  </div>

                  {/* Minting duration */}
                  {/* <div className=''>
                    <label htmlFor='mintingDuration'>Minting duration: </label>
                    <select
                      className='w-full px-4 py-3 rounded-lg outline-none font-thin'
                      ref={mintingDurationRef}
                      id='mintingDuration'
                      name='mintingDuration'
                      defaultValue={'open'}
                    >
                      <option value='24h'>24 hours</option>
                      <option value='1week'>1 week</option>
                      <option value='1month'>1 month</option>
                      <option value='3months'>3 months</option>
                      <option value='6months'>6 months</option>
                      <option value='1year'>1 year</option>
                      <option value='open'>OPEN</option>
                    </select>
                  </div> */}

                  {/* Payout/splits */}
                  <PayoutSplits
                    payoutRecipients={payoutRecipients}
                    setPayoutRecipients={setPayoutRecipients}
                  />
                  <EditionSize
                    editionSize={editionSize}
                    setEditionSize={setEditionSize}
                  />
                  {/* <MintStart /> */}
                </div>

                {/* Submit button: */}
                <div className='mt-6'>
                  <button
                    className={
                      'bg-blue-200 w-full p-5 leading-none md:leading-normal md:p-6 mt-3 text-lg text-black rounded-lg hover:bg-blue-300 duration-300 md:hover:scale-[1.02] ' +
                      (validationError?.all
                        ? ' bg-red-400 hover:bg-red-400 hover:scale-100 text-black/50 cursor-not-allowed'
                        : '') +
                      (processingSubmit === 'processing'
                        ? ' cursor-wait bg-gray-200 hover:bg-gray-200 hover:scale-100'
                        : '') +
                      (processingSubmit === 'success'
                        ? ' bg-green-400 hover:bg-green-400 hover:scale-100 text-sm flex items-center gap-2 justify-center max-w-[750px]'
                        : '') +
                      (processingSubmit === 'error'
                        ? ' bg-red-400 hover:bg-red-400 hover:scale-100'
                        : '')
                    }
                    type='submit'
                  >
                    {submitMessage}
                  </button>
                  {validationError?.all && (
                    <div className='text-orange-700 text-sm max-w-[700px] mb-2'>
                      {validationError.all}
                    </div>
                  )}
                </div>
                <Link
                  href='/'
                  className='absolute bottom-3 left-3 rounded-md bg-white/20 z-20 w-[34px] h-[34px] flex items-center justify-center'
                >
                  <IoIosArrowRoundBack
                    size={31}
                    className='opacity-80 text-sph-purple-light'
                  />
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
