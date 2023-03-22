import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useCatch, useLoaderData, useParams } from "@remix-run/react";
import JokeDisplay from "~/components/joke";
import { prisma } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";

export const action = async ({ params, request }: ActionArgs) => {
  const form = await request.formData();
  if (form.get("intent") !== "delete") {
    throw new Response(`The intent ${form.get("intent")} is not supported`);
  }
  const userId = await requireUserId(request);
  const joke = await prisma.joke.findUnique({ where: { id: params.jokeId } });
  if (!joke) {
    throw new Response("Can't delete what does not exist", { status: 404 });
  }
  if (joke.jokesterId !== userId) {
    throw new Response("Pssh, nice try. That's not your joke", { status: 403 });
  }
  await prisma.joke.delete({ where: { id: params.jokeId } });
  return redirect("/jokes");
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await getUserId(request);
  const joke = await prisma.joke.findUnique({ where: { id: params.jokeId } });
  if (!joke) throw new Response("What a joke! Not found.", { status: 404 });
  return json({ joke, isOwner: userId === joke.jokesterId });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return {
      title: "No joke",
      description: "No joke found",
    };
  }
  return {
    title: `"${data.joke.name}" joke`,
    description: `Enjoy the "${data.joke.name}" joke and much more`,
  };
};

function JokeRoute() {
  const { joke, isOwner } = useLoaderData<typeof loader>();

  return <JokeDisplay isOwner={isOwner} joke={joke} />;
}

export default JokeRoute;

export function ErrorBoundary({ error }: { error: Error }) {
  const { jokeId } = useParams();

  return (
    <div className="error-container">
      There was an error loading joke with id: {jokeId}. Sorry!
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  switch (caught.status) {
    case 400: {
      return (
        <div className="error-container">
          What you're trying to do is not allowed.
        </div>
      );
    }
    case 404: {
      return (
        <div className="error-container">
          Huh? What the hak is {params.jokeId}?
        </div>
      );
    }
    case 403: {
      return (
        <div className="error-container">
          Sorry, but {params.jokeId} is not your joke.
        </div>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}
