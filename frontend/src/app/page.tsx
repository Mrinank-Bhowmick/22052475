import Link from "next/link";

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center ">
      <h1 className="text-2xl font-bold mb-4">Welcome to the App</h1>
      <div className="flex gap-4">
        <Link href="/users">
          <button className="p-6 cursor-pointer ">/Users</button>
        </Link>
        <Link href="/posts">
          <button className="p-6 cursor-pointer">/Posts</button>
        </Link>
      </div>
    </div>
  );
};

export default Page;
