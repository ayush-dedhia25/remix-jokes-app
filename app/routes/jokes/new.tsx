import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useCatch,
  useNavigation,
} from "@remix-run/react";
import JokeDisplay from "~/components/joke";
import { prisma } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUserId, requireUserId } from "~/utils/session.server";

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "That joke is too short";
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return "That joke's  name is too short";
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (!userId) throw new Response("Unauthorized", { status: 401 });
  return json({});
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const name = form.get("name");
  const content = form.get("content");

  if (typeof name !== "string" || typeof content !== "string") {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly",
    });
  }

  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields: { name, content },
      formError: "Form not submitted correctly",
    });
  }

  const joke = await prisma.joke.create({
    data: { name, content, jokesterId: userId },
  });
  return redirect(`/jokes/${joke.id}`);
};

function NewJokeRoute() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  if (navigation.formData) {
    const name = navigation.formData.get("name");
    const content = navigation.formData.get("content");
    if (
      typeof name === "string" &&
      typeof content === "string" &&
      !validateJokeContent(content) &&
      !validateJokeName(name)
    ) {
      return (
        <JokeDisplay
          joke={{ name, content }}
          isOwner={true}
          canDelete={false}
        />
      );
    }
  }

  return (
    <div>
      <p>Add your own hilarious joke here</p>
      <Form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              type="text"
              defaultValue={actionData?.fields?.name}
              name="name"
              style={{ marginTop: 10 }}
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-errormessage={
                actionData?.fieldErrors?.name ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name && (
            <p id="name-error" className="form-validation-error" role="alert">
              {actionData?.fieldErrors?.name}
            </p>
          )}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              defaultValue={actionData?.fields?.name}
              name="content"
              style={{ marginTop: 10 }}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.content ? "content-error" : undefined
              }
            ></textarea>
          </label>
          {actionData?.fieldErrors?.content && (
            <p
              id="content-error"
              className="form-validation-error"
              role="alert"
            >
              {actionData?.fieldErrors?.content}
            </p>
          )}
        </div>
        <div>
          {actionData?.formError && (
            <p className="form-validation-error" role="alert">
              {actionData?.formError}
            </p>
          )}
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}

export default NewJokeRoute;

export function ErrorBoundary() {
  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to create a joke.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }
}
