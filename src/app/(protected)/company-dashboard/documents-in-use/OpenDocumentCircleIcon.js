/**
 * Blue circular “open document” icon (opens file in new tab).
 */
export default function OpenDocumentCircleIcon({ className = 'w-[21px] h-[21px]' }) {
  return (
    <svg
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M0 10.5C0 4.70101 4.70101 0 10.5 0C16.299 0 21 4.70101 21 10.5C21 16.299 16.299 21 10.5 21C4.70101 21 0 16.299 0 10.5Z"
        fill="#4C9AFF"
      />
      <path
        d="M12.4951 7.83637C14.2296 7.83637 13.4951 10.3818 13.4951 10.3818C13.4951 10.3818 15.9951 9.57033 15.9951 11.4V15.9818H9.99516V7.83637H12.4951ZM12.9086 6.81818H8.99517V17H16.9951V10.9713C16.9951 9.7536 14.4896 6.81818 12.9086 6.81818Z"
        fill="white"
      />
      <path
        d="M11.4952 4.78182L12.9951 5.8H7.99517V15.9818H6.99518V4.78182H11.4952Z"
        fill="white"
      />
      <path d="M9.49509 3L10.9951 4.01818H5.99511V14.2H4.99512V3H9.49509Z" fill="white" />
    </svg>
  );
}
