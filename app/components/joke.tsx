import type { Joke } from "@prisma/client";
import { Form, Link } from "@remix-run/react";

function JokeDisplay({
  canDelete = true,
  isOwner,
  joke,
}: {
  canDelete?: boolean;
  isOwner: boolean;
  joke: Pick<Joke, "content" | "name">;
}) {
  return (
    <div>
      <h3>Here's your hilarious joke:</h3>
      <p>{joke.content}</p>
      <Link to="." style={{ marginBottom: "15px", display: "block" }}>
        "{joke.name}" Permalink
      </Link>
      {isOwner && (
        <Form method="post">
          <button
            type="submit"
            className="button"
            disabled={!canDelete}
            name="intent"
            value="delete"
          >
            Delete
          </button>
        </Form>
      )}
    </div>
  );
}

export default JokeDisplay;
