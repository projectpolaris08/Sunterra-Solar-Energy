import React from "react";
import styled from "styled-components";

interface AnimatedButtonProps {
  onClick?: () => void;
  text?: string;
  className?: string;
  size?: "small" | "medium" | "default";
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onClick,
  text = "GET STARTED",
  className = "",
  size = "default",
}) => {
  const buttonText = text.toUpperCase();
  const textArray = buttonText.split("");

  return (
    <StyledWrapper className={className} $size={size}>
      <label htmlFor={`button-${text}`} className="area" onClick={onClick}>
        <input type="checkbox" defaultChecked id={`button-${text}`} />
        <button className="button" type="button">
          <div className="wave" />
          <div className="wrap">
            <div className="reflex" />
            <div className="content">
              <span className="text state-1">
                {textArray.map((char, index) => (
                  <span
                    key={index}
                    style={{ "--i": index + 1 } as React.CSSProperties}
                    data-label={char}
                  >
                    {char}
                  </span>
                ))}
              </span>
              <span className="text state-2">
                {textArray.map((_, index) => (
                  <span
                    key={index}
                    style={{ "--i": index + 1 } as React.CSSProperties}
                    data-label="⎯"
                  >
                    ⎯
                  </span>
                ))}
              </span>
            </div>
          </div>
          <div className="gears">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 635 523"
            >
              <defs>
                <filter id="filter">
                  <feGaussianBlur
                    result="blur"
                    stdDeviation={5}
                    in="SourceGraphic"
                  />
                  <feColorMatrix
                    result="goo"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
                    type="matrix"
                    in="blur"
                  />
                  <feBlend in2="goo" in="SourceGraphic" />
                </filter>
              </defs>
              <g filter="url(#filter)">
                <path
                  className="large shadow"
                  d="M635 192V171L606 167C605 157 603 148 600 139L625 125L617 106L589 113C584 105 579 97 573 89L592 66L577 51L554 68C547 62 539 57 530 52L537 24L518 16L504 41C495 38 486 36 476 35L472 8H451L447 37C437 38 428 40 419 43L405 18L386 26L393 54C385 59 377 64 369 70L346 53L331 66L348 89C342 96 337 104 332 113L304 106L296 125L321 139C318 148 316 157 315 167L286 171V192L315 196C316 206 318 215 321 224L296 238L304 257L332 250C337 258 342 266 348 274L331 297L346 312L369 295C376 301 384 306 393 311L386 339L405 347L419 322C428 325 437 327 447 328L451 357H472L476 328C486 327 495 325 504 322L518 347L537 339L530 311C538 306 546 301 554 295L577 312L592 297L575 274C581 267 586 259 591 250L619 257L627 238L602 224C605 215 607 206 608 196L635 192ZM461 292C400 292 351 243 351 182C351 121 401 72 461 72C521 72 571 121 571 182C571 243 522 292 461 292Z"
                />
                <path
                  className="medium shadow"
                  d="M392 398V377L364 373C363 363 360 354 357 345L380 328L369 310L342 321C336 313 329 307 322 301L333 275L315 264L298 287C289 283 280 281 270 280L266 252H245L241 280C231 281 222 284 213 287L196 264L178 275L189 301C181 307 175 314 169 321L143 310L132 328L155 345C151 354 149 363 148 373L120 377V398L148 402C149 412 152 421 155 430L132 447L143 465L169 454C175 462 182 468 189 474L178 500L196 511L213 488C222 492 231 494 241 495L245 523H266L270 495C280 494 289 491 298 488L315 511L333 500L322 474C330 468 336 461 342 454L368 465L379 447L356 430C360 421 362 412 363 402L392 398ZM255 461C214 461 181 428 181 387C181 346 214 313 255 313C296 313 329 346 329 387C328 428 295 461 255 461Z"
                />
                <path
                  className="small shadow"
                  d="M200 244V223L171 219C169 209 165 201 160 193L178 170L163 155L140 173C132 168 123 164 114 162L110 133H90L86 162C76 164 68 168 60 173L37 155L22 170L40 193C35 201 31 210 29 219L0 223V244L29 248C31 258 35 266 40 274L22 297L37 312L60 294C68 299 77 303 86 305L90 334H111L115 305C125 303 133 299 141 294L164 312L179 297L161 274C166 266 170 257 172 248L200 244ZM100 270C80 270 63 253 63 233C63 213 80 196 100 196C120 196 137 213 137 233C137 253 121 270 100 270Z"
                />
                <path
                  className="large"
                  d="M635 184V163L606 159C605 149 603 140 600 131L625 117L617 98L589 105C584 97 579 89 573 81L592 58L577 43L554 60C547 54 539 49 530 44L537 16L518 8L504 33C495 30 486 28 476 27L472 0H451L447 29C437 30 428 32 419 35L405 9L386 17L393 45C385 50 377 55 369 61L346 44L331 58L348 81C342 88 337 96 332 105L304 98L296 117L321 131C318 140 316 149 315 159L286 163V184L315 188C316 198 318 207 321 216L296 230L304 249L332 242C337 250 342 258 348 266L331 289L346 304L369 287C376 293 384 298 393 303L386 331L405 339L419 314C428 317 437 319 447 320L451 349H472L476 320C486 319 495 317 504 314L518 339L537 331L530 303C538 298 546 293 554 287L577 304L592 289L575 266C581 259 586 251 591 242L619 249L627 230L602 216C605 207 607 198 608 188L635 184ZM461 284C400 284 351 235 351 174C351 113 401 64 461 64C521 64 571 113 571 174C571 235 522 284 461 284Z"
                />
                <path
                  className="medium"
                  d="M392 390V369L364 365C363 355 360 346 357 337L380 320L369 302L342 313C336 305 329 299 322 293L333 267L315 256L298 279C289 275 280 273 270 272L266 244H245L241 272C231 273 222 276 213 279L196 256L178 267L189 293C181 299 175 306 169 313L143 302L132 320L155 337C151 346 149 355 148 365L120 369V390L148 394C149 404 152 413 155 422L132 439L143 457L169 446C175 454 182 460 189 466L178 492L196 503L213 480C222 484 231 486 241 487L245 515H266L270 487C280 486 289 483 298 480L315 503L333 492L322 466C330 460 336 453 342 446L368 457L379 439L356 422C360 413 362 404 363 394L392 390ZM255 453C214 453 181 420 181 379C181 338 214 305 255 305C296 305 329 338 329 379C328 420 295 453 255 453Z"
                />
                <path
                  className="small"
                  d="M200 236V215L171 211C169 201 165 193 160 185L178 162L163 147L140 165C132 160 123 156 114 154L110 125H90L86 154C76 156 68 160 60 165L37 147L22 162L40 185C35 193 31 202 29 211L0 215V236L29 240C31 250 35 258 40 266L22 289L37 304L60 286C68 291 77 295 86 297L90 326H111L115 297C125 295 133 291 141 286L164 304L179 289L161 266C166 258 170 249 172 240L200 236ZM100 262C80 262 63 245 63 225C63 205 80 188 100 188C120 188 137 205 137 225C137 245 121 262 100 262Z"
                />
              </g>
            </svg>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 478 224"
            className="sparks"
          >
            <path
              strokeLinecap="round"
              d="M172.675 130.318C176.079 94.8544 183.101 52.6838 262.101 32.6837"
              style={{ "--i": 1 } as React.CSSProperties}
            />
            <path
              strokeLinecap="round"
              d="M286.569 127.661C299.204 94.3501 317.096 55.5231 398.574 57.0604"
              style={{ "--i": 4 } as React.CSSProperties}
            />
            <path
              strokeLinecap="round"
              d="M335.954 194.26C370.153 182.301 412.468 170.335 474.474 222.038"
              style={{ "--i": 6 } as React.CSSProperties}
            />
            <path
              strokeLinecap="round"
              d="M265.974 116.351C261.897 79.6629 253.871 36.3728 169.162 24.4022"
              style={{ "--i": 10 } as React.CSSProperties}
            />
            <path
              strokeLinecap="round"
              d="M131.475 153.296C107.914 126.572 77.4904 96.5377 1.77821 126.682"
              style={{ "--i": 3 } as React.CSSProperties}
            />
            <path
              strokeLinecap="round"
              d="M153.453 170.383C161.298 135.631 167.803 93.3778 99.0048 49.6985"
              style={{ "--i": 5 } as React.CSSProperties}
            />
            <path
              strokeLinecap="round"
              d="M309.315 154.41C341.202 155.086 380.493 154.234 434.104 111.701"
              style={{ "--i": 12 } as React.CSSProperties}
            />
            <path
              d="M109 193C54.6 140.2 66.3333 99 79 85"
              style={{ "--i": 7 } as React.CSSProperties}
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 401 68"
            height={68}
            width={401}
            className="path"
          >
            <path
              strokeOpacity="0.2"
              strokeLinecap="round"
              d="M313.89 11.6484C322.652 28.147 374.652 31.5 397.652 0.999998"
            />
            <path
              strokeOpacity="0.3"
              strokeLinecap="round"
              d="M290.652 17.0773C294.773 34.8416 359.652 50.5 387.152 24"
            />
            <path
              strokeOpacity="0.5"
              strokeLinecap="round"
              d="M265.152 17.0773C274.152 38 323.652 68 362.152 42"
            />
            <path
              strokeOpacity="0.7"
              strokeLinecap="round"
              d="M241.75 17.0773C251.653 45 302.152 74.5 332.152 46.5"
            />
            <path
              strokeOpacity="0.9"
              strokeLinecap="round"
              d="M220.152 17.0773C230.055 45 274.652 81.5 288.652 47"
            />
            <path
              strokeLinecap="round"
              d="M200.982 17.0773C209.652 55 239.152 80 245.652 58.5"
            />
            <path
              strokeLinecap="round"
              d="M200.67 17.0773C192 55 162.5 80 156 58.5"
            />
            <path
              strokeOpacity="0.9"
              strokeLinecap="round"
              d="M181.5 17.0773C171.597 45 127 81.5 113 47"
            />
            <path
              strokeOpacity="0.7"
              strokeLinecap="round"
              d="M159.903 17.0773C150 45 99.4999 74.5 69.4999 46.5"
            />
            <path
              strokeOpacity="0.5"
              strokeLinecap="round"
              d="M136.5 17.0773C127.5 38 77.9999 68 39.4999 42"
            />
            <path
              strokeOpacity="0.3"
              strokeLinecap="round"
              d="M111 17.0773C106.879 34.8416 41.9999 50.5 14.4999 24"
            />
            <path
              strokeOpacity="0.2"
              strokeLinecap="round"
              d="M87.7628 11.6484C78.9999 28.147 27 31.5 4.00004 0.999998"
            />
          </svg>
        </button>
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ $size?: "small" | "medium" | "default" }>`
  .area {
    --ease: cubic-bezier(0.5, 0, 0.3, 1);
    --ease-elastic: cubic-bezier(0.5, 2, 0.3, 0.8);
    --radius: ${(props) =>
      props.$size === "small"
        ? "16px"
        : props.$size === "medium"
        ? "22px"
        : "26px"};
    
    @media (max-width: 768px) {
      --radius: ${(props) =>
        props.$size === "small"
          ? "14px"
          : props.$size === "medium"
          ? "20px"
          : "26px"};
    }
    --primary: #2563eb;
    position: relative;
    cursor: pointer;
    user-select: none;
    transition: all 0.6s var(--ease-elastic);
  }

  .area input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .button {
    outline: none;
    cursor: pointer;
    border: 0;
    border-radius: var(--radius);
    position: relative;
    width: ${(props) =>
      props.$size === "small"
        ? "130px"
        : props.$size === "medium"
        ? "200px"
        : "240px"};
    height: ${(props) =>
      props.$size === "small"
        ? "42px"
        : props.$size === "medium"
        ? "60px"
        : "74px"};
    pointer-events: none;
    transform-style: preserve-3d;
    perspective: 1000px;
    transition: background-color 2s linear, box-shadow 0.5s ease,
      transform 0.6s ease;
    transform: rotateX(4deg);
    background: var(--primary);
    box-shadow: inset 0 0 30px rgb(37, 99, 235),
      0 5px 10px -2px rgba(0, 10, 20, 0.5),
      0 40px 30px -15px rgba(10, 20, 30, 0.3), inset 0 -2px 0 -1px #484e60,
      inset 0 0 2px 4px #888ea3;
    font-size: ${(props) =>
      props.$size === "small"
        ? "11px"
        : props.$size === "medium"
        ? "16px"
        : "21px"};
    font-family: Arial;
    letter-spacing: ${(props) =>
      props.$size === "small"
        ? "0.2px"
        : props.$size === "medium"
        ? "0.7px"
        : "1px"};
    white-space: nowrap;
    
    @media (max-width: 768px) {
      width: ${(props) =>
        props.$size === "small"
          ? "120px"
          : props.$size === "medium"
          ? "180px"
          : "240px"};
      height: ${(props) =>
        props.$size === "small"
          ? "38px"
          : props.$size === "medium"
          ? "54px"
          : "74px"};
      font-size: ${(props) =>
        props.$size === "small"
          ? "10px"
          : props.$size === "medium"
          ? "14px"
          : "21px"};
    }
    }
  }

  .button::before,
  .button::after {
    content: "";
    border-radius: 50%;
    width: 100px;
    height: 100px;
    background: white;
    position: absolute;
    display: block;
    filter: blur(40px);
    mix-blend-mode: plus-lighter;
    margin: auto;
    inset: 0;
    top: 10px;
    transition: all 1s ease;
  }

  @keyframes pulse-out {
    40% {
      transform: scale(1);
    }
  }

  .button:after {
    transform: scale(0);
    animation: pulse-out 3s var(--ease-elastic) infinite;
  }

  .button:before,
  .area input:not(:checked) ~ .button::after {
    opacity: 0;
  }

  .area input:not(:checked) ~ .button::before {
    opacity: 1;
  }

  .wrap {
    border-radius: calc(var(--radius) * 0.85);
    inset: 0;
    padding: 0;
    background: linear-gradient(
      to bottom,
      #3b82f6 0%,
      #2563eb 50%,
      #1d4ed8 100%
    );
    position: absolute;
    transform-origin: top;
    transform: scale(0.99, 1) translate(0px, -7px);
    transition: all 0.7s ease;
    animation: cover-close 0.9s ease forwards;
  }

  .area input:not(:checked) ~ .button {
    .wrap {
      animation: cover-open 0.9s ease forwards;
    }
  }

  @keyframes cover-open {
    0% {
      transform: translate3d(0, -7px, 10px);
      box-shadow: none;
    }
    20% {
      transform: translate3d(0, 0, 10px);
    }
    80% {
      transform: translate3d(0, 0, 10px) rotateY(0) rotateX(74deg);
    }
    100% {
      transform: translate3d(0, 0, 10px) rotateY(0) rotateX(70deg);
      box-shadow: rgb(121, 133, 147) 0px 5px 1px -1px,
        rgb(77, 97, 118) 0px 9px 0 -2px, rgb(0, 0, 0) 0px 60px 40px -30px;
    }
  }

  @keyframes cover-close {
    from {
      transform: translate3d(0px, 0px, 10px) rotateY(0) rotateX(70deg);
      box-shadow: 0 5px 1px -1px #798593, 0 10px 0px -1px #4d6176,
        0 60px 40px -30px black;
    }
    to {
      transform: scale(0.99, 1) translate3d(0px, -7px, 10px);
      box-shadow: none;
    }
  }

  .reflex {
    position: absolute;
    z-index: 9;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
  }
  .reflex:before {
    content: "";
    position: absolute;
    width: 300px;
    background-color: rgba(255, 255, 255, 0.2);
    background: linear-gradient(
      to right,
      rgba(221, 249, 255, 0.2) 10%,
      rgba(221, 245, 255, 0.5) 60%,
      rgba(221, 246, 255, 0.4) 60%,
      rgba(221, 255, 254, 0.2) 90%
    );
    top: -40%;
    bottom: -40%;
    left: -132%;
    transform: translateX(0) skew(-30deg);
    transition: all 0.7s var(--ease);
  }
  .area:hover .reflex:before {
    transform: translate(192%, 0) skew(-30deg);
  }

  .path {
    position: absolute;
    left: 50%;
    top: 87%;
    transform: translateX(-50%);
    stroke-dasharray: 60 150;
    stroke-dashoffset: 60;
    pointer-events: none;
    overflow: visible;
    animation: path-in 0.6s linear forwards;
    stroke-width: 2px;
  }
  .area input:not(:checked) ~ .button .path {
    animation: path-out 1.2s ease forwards;
  }
  @keyframes path-out {
    from {
      transform: translateX(-50%) translateY(-15px);
      stroke: white;
    }
    to {
      stroke-dashoffset: -150;
      stroke: var(--primary);
      transform: translateX(-50%) translateY(15px);
    }
  }

  @keyframes path-in {
    from {
      stroke-dashoffset: -150;
      transform: translateX(-50%) translateY(-5px);
      stroke: white;
    }
    to {
      stroke: var(--primary);
      transform: translateX(-50%) translateY(-16px);
    }
  }

  .wave {
    position: absolute;
    margin: auto;
    transition: all 0.5s ease;
    border-radius: 70px;
    width: 110%;
    height: 150%;
    left: 50%;
    top: 56%;
    transform: translate(-50%, -50%);
    opacity: 0;
  }
  .wave::before,
  .wave::after {
    content: "";
    position: absolute;
    border-radius: inherit;
    border-bottom: 3px solid white;
    border-top: 3px solid white;
    filter: blur(3px);
    inset: 0;
    transform: translate(50%);
    animation: wave 1.5s linear infinite;
  }
  .wave::after {
    animation-delay: 0.4s;
  }

  .area input:not(:checked) ~ .button .wave {
    opacity: 1;
  }

  @keyframes wave {
    0% {
      transform: scale(1);
      opacity: 0;
      box-shadow: 0 0 30px white;
    }
    35% {
      transform: scale(1.3);
      opacity: 1;
    }
    70%,
    100% {
      transform: scale(1.6);
      opacity: 0;
      box-shadow: 0 0 100px var(--primary);
    }
  }

  .content {
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    position: relative;
    height: 100%;
    gap: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
    overflow: hidden;
    border-radius: calc(var(--radius) * 0.85);
  }

  .content::before,
  .content::after {
    content: "";
    inset: 0px;
    position: absolute;
    transition: all 1s var(--ease);
    border-radius: inherit;
    z-index: -1;
  }
  .content::before {
    filter: blur(2px);
    top: -2px;
    background: linear-gradient(to bottom, #dde0e1 30%, #aeb2b8 90%);
  }
  .content::after {
    box-shadow: inset 0 -7px 1px 0 rgba(40, 70, 100, 0.2),
      inset 0 -4px 1px 0 rgba(40, 70, 100, 0.4),
      inset 0 -2px 0 0 rgba(20, 40, 60, 0.6), inset 0 -3px 0 0 white;
  }

  .text {
    transition: all 0.3s ease;
    transform: translateY(-2px);
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    inset: 0;
    white-space: nowrap;
    flex-wrap: nowrap;
  }
  .text span {
    display: inline-block;
    color: transparent;
    position: relative;
    white-space: nowrap;
  }
  .text.state-1 span:nth-child(3) {
    margin-right: 10px;
  }

  .text span::before,
  .text span::after {
    content: attr(data-label);
    position: absolute;
    left: 0;
    color: #3c5d7d;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.7);
  }
  .text span::before {
    opacity: 0;
    transform: translateY(-100%);
  }

  .text.state-2 {
    span::before,
    span::after {
      color: #6b99b0;
    }
  }

  .area input:checked ~ .button .text.state-2 {
    span {
      filter: blur(5px);
    }
  }

  .area:hover .text span::before {
    animation: char-in 0.8s ease calc(var(--i) * 0.04s) forwards;
  }

  .area:hover .text span::after,
  .area input:not(:checked) ~ .button .text.state-1 span::before,
  .area input:not(:checked) ~ .button .text.state-1 span::after,
  .area input:checked ~ .button .text.state-2 span::before,
  .area input:checked ~ .button .text.state-2 span::after {
    opacity: 0;
    animation: char-out 1.2s ease calc(var(--i) * 0.04s) backwards;
  }

  @keyframes char-in {
    0% {
      opacity: 0;
      transform: scale(10) translateX(-100%);
      filter: blur(10px);
      color: rgb(0, 251, 255);
    }
    25% {
      transform: translateY(10%)
        translateX(calc(-40px + ((var(--i) - 1) / 10) * 80px)) scale(2);
      opacity: 1;
      filter: blur(1px);
      color: transparent;
    }
    50% {
      transform: translateY(20%);
      opacity: 1;
      filter: blur(0);
    }
    100% {
      transform: translateY(0);
      opacity: 1;
      filter: blur(0);
    }
  }
  @keyframes char-out {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    40% {
      color: white;
    }
    100% {
      transform: translateY(-80%) scale(4);
      filter: blur(4px);
      color: black;
      text-shadow: 0 4px 2px #2563eb;
      opacity: 0;
    }
  }

  .area:hover {
    .button {
      transition: all 0.6s var(--ease-elastic), background 1s ease;
      transform: rotateX(0deg) translateY(5px);
    }
    .content::before {
      transform: scale(0.97, 0.92);
    }
  }

  .area:active {
    .button {
      transform: rotateX(0deg) translateY(8px);
    }
    .wrap {
      transform: scale(1) translate(0);
    }
    .wave {
      opacity: 0;
    }
    .content::before {
      filter: blur(13px);
      transform: scaleX(0.95);
    }
  }

  .sparks {
    pointer-events: none;
    position: absolute;
    margin: auto;

    transform: translateZ(100px);
    stroke: rgba(255, 153, 0, 1);
    left: ${(props) =>
      props.$size === "small"
        ? "32px"
        : props.$size === "medium"
        ? "46px"
        : "54px"};
    top: ${(props) =>
      props.$size === "small"
        ? "5px"
        : props.$size === "medium"
        ? "8px"
        : "10px"};
    height: ${(props) =>
      props.$size === "small"
        ? "32px"
        : props.$size === "medium"
        ? "46px"
        : "58px"};
    
    @media (max-width: 768px) {
      left: ${(props) =>
        props.$size === "small"
          ? "28px"
          : props.$size === "medium"
          ? "42px"
          : "54px"};
      top: ${(props) =>
        props.$size === "small"
          ? "4px"
          : props.$size === "medium"
          ? "7px"
          : "10px"};
      height: ${(props) =>
        props.$size === "small"
          ? "28px"
          : props.$size === "medium"
          ? "42px"
          : "58px"};
    }
    opacity: 0;

    path {
      stroke-width: 5px;
      stroke-dasharray: 30 150;
      stroke-dashoffset: 30;
      animation: sparks 0.6s ease infinite;
      animation-delay: calc(var(--i) * 1s);
      animation-duration: calc(var(--i) * 0.05s + 0.6s);
    }
  }

  @keyframes sparks {
    0% {
      stroke-dasharray: 30 150;
    }
    50%,
    100% {
      stroke-dashoffset: -150;
    }
  }

  .area input:not(:checked) ~ .button {
    .gears,
    .sparks {
      opacity: 1;
    }
    .sparks {
      transition: all 1.5s ease;
    }
  }

  .gears {
    overflow: hidden;
    border-radius: inherit;
    opacity: 0;
    position: absolute;
    inset: 4px;
    bottom: 1px;
    transition: all 1s ease;

    svg {
      width: ${(props) => (props.$size === "small" ? "70%" : "80%")};
      fill: #2563eb;
      top: 50%;
      position: relative;
      transform: translate(-50%, -50%);
      left: 43%;

      path {
        transform-origin: center;
        transform-box: fill-box;
      }
      .shadow {
        fill: rgba(37, 99, 235, 0.2);
        translate: 2px 8px;
      }
      .small {
        animation: spin 2.5s infinite linear;
      }
      .medium {
        animation: spin reverse 3.75s infinite linear;
      }
      .large {
        translate: 3px -6px;
        animation: spin 5s infinite linear;
      }
    }
  }
  .gears::before,
  .gears::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    bottom: 11px;
    height: 7px;
    width: 7px;
    background: rgba(155, 155, 155, 0.3);
    box-shadow: inset 0px 2px rgba(0, 0, 0, 0.2);
  }
  .gears::before {
    left: 12px;
  }
  .gears::after {
    right: 12px;
  }

  @keyframes spin {
    to {
      transform: rotate(359deg);
    }
  }
`;

export default AnimatedButton;
