import Image from 'next/image';
// import * as tokenTypes from '../../../types/tokens';
import type {
  ReservoirTokensResponse,
  ReservoirToken,
} from '../../../types/tokens';

interface tokenType {
  token: {
    description: string;
  };
}

export default function GridViewItemMobile({
  token,
}: {
  token: ReservoirToken;
}) {
  return (
    <div className='flex flex-col items-center border-[1px] bg-purple-300/20 border-purple-300/20 rounded-lg w-full'>
      {/* IMAGE */}
      <div className='w-full aspect-square flex items-center bg-black/20'>
        {token?.token?.image && (
          <Image
            src={token.token.image}
            alt={token.token.name}
            layout='responsive'
            objectFit='contain'
            width={1}
            height={1}
            className={'w-full cursor-pointer'}
            //   onLoad={(e) => setImageLoaded(true)}
            onClick={() => {
              // largeMediaControls.start('visible');
              // setOpenLargeMedia(token);
            }}
          />
        )}
      </div>
      {/* DETAILS */}
      <div className='w-full flex flex-col gap-1 py-2 px-1'>
        <div className='my-1'>{token.token.name}</div>
        <div className='text-sm text-gray-400 hyphens-auto'>
          {token.token.description}
        </div>
      </div>
    </div>
  );
}
