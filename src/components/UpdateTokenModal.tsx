import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { IoCloseOutline } from 'react-icons/io5';
import { useStorageUpload } from '@thirdweb-dev/react';
import { useAccount, useSwitchChain } from 'wagmi';
import { zora } from 'wagmi/chains';
import type { Token } from '../../types/tokens';
import updateToken from '@/utils/updateToken';
import fetchOnChainTokenMetadata from '@/utils/fetchOnChainTokenMetadata';
import readTokenUriOnChain from '@/utils/readTokenUriOnChain';
import type { Address } from 'viem';

type Props = {
  open: boolean;
  onClose: () => void;
  token: Token['token'];
  onUpdated?: (patchedFields: Partial<Token['token']>) => void;
};

function FileInputButton({
  id,
  accept,
  onChange,
  hasCurrent,
}: {
  id: string;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasCurrent: boolean;
}) {
  return (
    <div>
      <input
        id={id}
        type='file'
        accept={accept}
        onChange={onChange}
        className='hidden'
      />
      <label
        htmlFor={id}
        className='inline-block cursor-pointer px-3 py-1 rounded-md text-xs font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 active:bg-slate-500 transition-colors duration-200'
      >
        {hasCurrent ? 'Change file' : 'Choose file'}
      </label>
    </div>
  );
}

function findAttr(attributes: Token['token']['attributes'], ...keys: string[]) {
  for (const key of keys) {
    const found = attributes?.find((a) => a.key === key);
    if (found) return found.value ?? '';
  }
  return '';
}

// True when the token's media IS its image (no distinct thumbnail exists).
function mediaIsImage(token: Token['token']) {
  return !token.media || token.mediaMimeType?.includes('image');
}

// Ask Alchemy to re-index the token's metadata. This just queues the crawl
// on Alchemy's side — it does not wait for or guarantee completion, so we
// don't poll for a match; the UI tells the user it may take a while.
async function triggerMetadataRefresh(tokenId: string) {
  const res = await fetch(
    `/api/refresh-token-metadata?tokenId=${tokenId}&triggerRefresh=1`,
  );
  return res.json();
}

export default function UpdateTokenModal({
  open,
  onClose,
  token,
  onUpdated,
}: Props) {
  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { mutateAsync: upload } = useStorageUpload();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attTo, setAttTo] = useState('');
  const [attFrom, setAttFrom] = useState('');
  const [attYear, setAttYear] = useState('');
  const [attEvent, setAttEvent] = useState('');
  const [attMedia, setAttMedia] = useState('');
  const [attCreator, setAttCreator] = useState('');
  const [attTags, setAttTags] = useState('');
  const [attLocation, setAttLocation] = useState('');

  const [media, setMedia] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showThumbnailInput, setShowThumbnailInput] = useState(false);

  const [processing, setProcessing] = useState<
    'initial' | 'processing' | 'success' | 'error'
  >('initial');
  const [message, setMessage] = useState('');
  const [phaseOneMedia, setPhaseOneMedia] = useState(false);
  const [phaseTwoMetadata, setPhaseTwoMetadata] = useState(false);
  const [phaseThreeTx, setPhaseThreeTx] = useState(false);

  // Pre-fill form when the modal opens or a different token is shown
  useEffect(() => {
    if (!open || !token) return;
    setName(token.name ?? '');
    setDescription(token.description ?? '');
    setAttTo(findAttr(token.attributes, 'To'));
    setAttFrom(findAttr(token.attributes, 'From'));
    setAttYear(findAttr(token.attributes, 'Year'));
    setAttEvent(findAttr(token.attributes, 'Event'));
    setAttMedia(findAttr(token.attributes, 'Media'));
    setAttCreator(findAttr(token.attributes, 'Creator'));
    setAttTags(findAttr(token.attributes, 'Tags', 'Content Tags'));
    setAttLocation(findAttr(token.attributes, 'Location'));
    setMedia(null);
    setImage(null);
    setMediaPreview(null);
    setImagePreview(null);
    setShowThumbnailInput(!mediaIsImage(token));
    setProcessing('initial');
    setMessage('');
    setPhaseOneMedia(false);
    setPhaseTwoMetadata(false);
    setPhaseThreeTx(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, token?.tokenId]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaPreview(null);
    setShowThumbnailInput(false);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes('image')) setShowThumbnailInput(true);
    if (file.type.includes('image') || file.type.includes('video')) {
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
    setMedia(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImagePreview(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.includes('image')) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
    setImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !token?.tokenId) return;

    setProcessing('processing');
    setPhaseOneMedia(false);
    setPhaseTwoMetadata(false);
    setPhaseThreeTx(false);

    try {
      if (chainId !== zora.id) {
        await switchChainAsync({ chainId: zora.id });
      }

      // Phase 1: upload new media files (if provided), otherwise reuse existing URIs
      const existingIsImage = mediaIsImage(token);
      let mediaUri: string = token.media ?? token.image ?? '';
      let imageUri: string = token.image ?? '';

      if (media) {
        const uris = await upload({ data: [media] });
        mediaUri = uris[0];
        if (media.type.includes('image')) imageUri = uris[0];
      }
      if (image) {
        const uris = await upload({ data: [image] });
        imageUri = uris[0];
      }

      setPhaseOneMedia(true);

      // Phase 2: build and upload metadata
      const newMediaIsImage = media
        ? media.type.includes('image')
        : existingIsImage;

      const metadataObj = {
        name,
        description,
        image: newMediaIsImage ? mediaUri : imageUri,
        content: {
          mime: media?.type ?? token.mediaMimeType ?? '',
          uri: mediaUri,
        },
        animation_url: !newMediaIsImage ? mediaUri : undefined,
        attributes: [
          { trait_type: 'To', value: attTo },
          { trait_type: 'From', value: attFrom },
          { trait_type: 'Year', value: attYear },
          { trait_type: 'Event', value: attEvent },
          { trait_type: 'Media', value: attMedia },
          { trait_type: 'Creator', value: attCreator },
          { trait_type: 'Tags', value: attTags },
          { trait_type: 'Location', value: attLocation },
        ],
      };

      const metadataUriArr = await upload({
        data: [JSON.stringify(metadataObj)],
      });
      const metadataUri = metadataUriArr[0];

      setPhaseTwoMetadata(true);

      // Phase 3: on-chain update
      const result = await updateToken(
        BigInt(token.tokenId),
        metadataUri,
        address as Address,
      );

      if (result.hash) {
        setPhaseThreeTx(true);

        // Ask Alchemy to re-index the new metadata (for its own CDN image
        // variant). Fire-and-forget: we don't wait for or verify
        // completion, since that can take much longer than it makes sense
        // to keep the user waiting here — and the panel below is refreshed
        // from a reliable on-chain source regardless of how this turns out.
        triggerMetadataRefresh(token.tokenId).catch((refreshErr) => {
          console.error('Error triggering metadata refresh:', refreshErr);
        });

        // Re-read the contract's tokenURI (ground truth for what the write
        // actually landed as) rather than trusting metadataUri was applied
        // as intended, then fetch that URI's metadata via thirdweb's
        // gateway so the panel can be updated with confirmed-fresh data.
        const liveUri = await readTokenUriOnChain(BigInt(token.tokenId));
        const freshMeta = liveUri
          ? await fetchOnChainTokenMetadata(liveUri)
          : null;

        if (freshMeta) {
          onUpdated?.(freshMeta);
          setProcessing('success');
          setMessage(`Fragment updated! Tx: ${result.hash.slice(0, 10)}...`);
        } else {
          setProcessing('success');
          setMessage(
            `Fragment updated! Tx: ${result.hash.slice(0, 10)}... (may take a while to reflect on The Anarchiving Game)`,
          );
        }
      } else if (result.error) {
        setProcessing('error');
        setMessage(result.error);
      }
    } catch (err) {
      console.error('Error in UpdateTokenModal handleSubmit:', err);
      setProcessing('error');
      setMessage(
        (err as { message?: string })?.message ?? 'Something went wrong.',
      );
    }
  };

  if (!open) return null;

  const textFields = [
    { id: 'u-to', label: 'To', value: attTo, set: setAttTo },
    { id: 'u-from', label: 'From', value: attFrom, set: setAttFrom },
    { id: 'u-event', label: 'Event', value: attEvent, set: setAttEvent },
    {
      id: 'u-creator',
      label: 'Creator',
      value: attCreator,
      set: setAttCreator,
    },
    { id: 'u-tags', label: 'Tags', value: attTags, set: setAttTags },
    {
      id: 'u-location',
      label: 'Location',
      value: attLocation,
      set: setAttLocation,
    },
  ];

  return createPortal(
    <div
      className='fixed inset-0 z-[99999999] flex items-center justify-center bg-black/70 backdrop-blur-[2px]'
      onClick={onClose}
    >
      <div
        className='relative bg-slate-800 text-slate-200 rounded-md mx-3 max-w-lg w-full max-h-[90vh] overflow-y-auto p-4'
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <button
          className='absolute top-2 right-2 z-10 blur-none'
          onClick={onClose}
          aria-label='Close'
        >
          <IoCloseOutline className='text-white' size={25} />
        </button>

        <div className='pt-5 pb-3 text-center text-base font-semibold tracking-wide'>
          Update fragment #{token?.tokenId}
        </div>

        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          {/* NAME */}
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-slate-400' htmlFor='u-title'>
              Title
            </label>
            <input
              id='u-title'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full px-3 py-2 rounded-md outline-none text-sm bg-slate-700 text-slate-200'
            />
          </div>

          {/* DESCRIPTION */}
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-slate-400' htmlFor='u-description'>
              Description
            </label>
            <textarea
              id='u-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full h-32 px-3 py-2 rounded-md outline-none text-sm bg-slate-700 text-slate-200 resize-none'
            />
          </div>

          {/* MEDIA FILE */}
          <div className='flex flex-col gap-1'>
            <label className='text-sm text-slate-400' htmlFor='u-media'>
              Media file
            </label>
            {token && !media && mediaIsImage(token) && token.image && (
              <div className='mb-1 w-20 h-20 bg-black/20 rounded overflow-hidden flex items-center justify-center'>
                <Image
                  src={token.imageSmall ?? token.image}
                  alt='current media (image)'
                  width={80}
                  height={80}
                  className='object-contain w-full h-full'
                  unoptimized
                />
              </div>
            )}
            {token &&
              !media &&
              !mediaIsImage(token) &&
              token.mediaMimeType?.includes('video') &&
              token.media && (
                <video
                  src={token.media}
                  className='mb-1 max-w-[200px] rounded'
                  muted
                  loop
                  playsInline
                  controls
                />
              )}
            {token &&
              !media &&
              !mediaIsImage(token) &&
              !token.mediaMimeType?.includes('video') &&
              token.media && (
                <div className='mb-1 text-xs text-slate-400'>
                  Current media: {token.mediaMimeType || 'file'} (no preview)
                </div>
              )}
            <FileInputButton
              id='u-media'
              accept='.jpg,.jpeg,.png,.mp4,.pdf,.html,.mpeg,.wav,.mp3,.ogg,.gif'
              onChange={handleMediaUpload}
              hasCurrent={!!token?.media || !!token?.image}
            />
            {mediaPreview?.includes('image') && (
              <div className='mt-1 max-w-[200px] bg-slate-600 rounded overflow-hidden'>
                <img
                  src={mediaPreview}
                  alt='media preview'
                  className='w-full object-cover'
                />
              </div>
            )}
            {mediaPreview?.includes('video') && (
              <video
                src={mediaPreview}
                className='mt-1 max-w-[200px] rounded'
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            {media &&
              !media.type.includes('image') &&
              !media.type.includes('video') && (
                <div className='mt-1 text-xs text-slate-100'>
                  Selected: {media.name} ({Math.ceil(media.size / 1024)} KB)
                </div>
              )}
          </div>

          {/* THUMBNAIL (shown when media is, or will be, non-image) */}
          {showThumbnailInput && (
            <div className='flex flex-col gap-1'>
              <label className='text-sm text-slate-400' htmlFor='u-thumb'>
                Thumbnail image
              </label>
              {token?.image && !image && (
                <div className='mb-1 w-20 h-20 bg-black/20 rounded overflow-hidden flex items-center justify-center'>
                  <Image
                    src={token.imageSmall ?? token.image}
                    alt='current thumbnail'
                    width={80}
                    height={80}
                    className='object-contain w-full h-full'
                    unoptimized
                  />
                </div>
              )}
              <FileInputButton
                id='u-thumb'
                accept='image/*'
                onChange={handleImageUpload}
                hasCurrent={!!token?.image}
              />
              {imagePreview && (
                <div className='mt-1 max-w-[200px] bg-slate-600 rounded overflow-hidden'>
                  <img
                    src={imagePreview}
                    alt='thumbnail preview'
                    className='w-full object-cover'
                  />
                </div>
              )}
            </div>
          )}

          {/* ATTRIBUTES */}
          <div className='flex flex-col gap-3 pt-1'>
            <div className='text-sm font-semibold text-slate-400 tracking-wider text-center border-t border-slate-600 pt-3'>
              Attributes
            </div>

            {textFields.map(({ id, label, value, set }) => (
              <div key={id} className='flex flex-col gap-1'>
                <label className='text-sm text-slate-400' htmlFor={id}>
                  {label}
                </label>
                <input
                  id={id}
                  type='text'
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className='w-full px-3 py-2 rounded-md outline-none text-sm bg-slate-700 text-slate-200'
                />
              </div>
            ))}

            {/* Year */}
            <div className='flex flex-col gap-1'>
              <label className='text-sm text-slate-400' htmlFor='u-year'>
                Year
              </label>
              <input
                id='u-year'
                type='number'
                min={1900}
                max={2099}
                value={attYear}
                onChange={(e) => setAttYear(e.target.value)}
                className='w-full px-3 py-2 rounded-md outline-none text-sm bg-slate-700 text-slate-200'
              />
            </div>

            {/* Media type */}
            <div className='flex flex-col gap-1'>
              <label className='text-sm text-slate-400' htmlFor='u-mediatype'>
                Media type
              </label>
              <div className='relative w-full'>
                <select
                  id='u-mediatype'
                  value={attMedia}
                  onChange={(e) => setAttMedia(e.target.value)}
                  className='w-full px-3 py-2 pr-8 rounded-md outline-none text-sm bg-slate-700 text-slate-200 appearance-none'
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
                <div className='pointer-events-none absolute inset-y-0 right-2 flex items-center'>
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
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type={processing === 'success' ? 'button' : 'submit'}
            onClick={processing === 'success' ? onClose : undefined}
            disabled={processing === 'processing'}
            className={
              'mt-2 w-full py-3 rounded-md text-sm font-medium transition-all duration-300 ' +
              (processing === 'initial'
                ? 'bg-sph-purple-light text-white hover:scale-[1.01]'
                : '') +
              (processing === 'processing'
                ? 'bg-slate-600 text-slate-300 cursor-wait'
                : '') +
              (processing === 'success'
                ? 'bg-green-600 text-white hover:scale-[1.01]'
                : '') +
              (processing === 'error' ? 'bg-red-600 text-white' : '')
            }
          >
            {processing === 'initial' && 'Update fragment'}
            {processing === 'processing' && (
              <div className='flex flex-col gap-1 text-xs'>
                <div>Please wait & accept the transaction in your wallet.</div>
                <div>
                  Phase 1: uploading media&hellip;{' '}
                  {phaseOneMedia ? (
                    <span className='text-green-400'>DONE</span>
                  ) : (
                    <span className='animate-pulse text-yellow-400'>WAIT</span>
                  )}
                </div>
                <div>
                  Phase 2: uploading metadata&hellip;{' '}
                  {phaseTwoMetadata ? (
                    <span className='text-green-400'>DONE</span>
                  ) : (
                    <span className='animate-pulse text-yellow-400'>WAIT</span>
                  )}
                </div>
                <div>
                  Phase 3: updating on-chain&hellip;{' '}
                  {phaseThreeTx ? (
                    <span className='text-green-400'>DONE</span>
                  ) : (
                    <span className='animate-pulse text-yellow-400'>WAIT</span>
                  )}
                </div>
              </div>
            )}
            {processing === 'success' && (
              <div className='flex flex-col gap-1'>
                <div>{message}</div>
                <div className='text-xs font-normal opacity-90'>
                  Click to close
                </div>
              </div>
            )}
            {processing === 'error' && message}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
