document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById("comment-form");
    if (!form) return;

    const postId = form.dataset.postId;
    const list = document.querySelector(".comment-list");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const authorInput = document.getElementById("comment-author");
        const contentInput = document.getElementById("comment-content");

        const author = authorInput.value.trim();
        const content = contentInput.value.trim();

        if (!author || !content) {
            alert("Please fill in both name and comment fields to post comment.");
            return;
        }

        try {
            const response = await fetch(`/post/${postId}/comments`, {
                method: "POST", headers: {"Content-Type": "application/json",}, body: JSON.stringify({author, content})
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.error || "Problem saving comment.");
            }

            const li = document.createElement("li");
            li.className = "comment-item";
            li.innerHTML = `
                <p><strong>${author}</strong> - ${data.created_at}</p>
                <p>${content}</p>
                <form method="POST" action="/admin/comments/${data.id}/delete">
                    <input type="hidden" name="postId" value="${postId}">
                    <button class="btn btn-delete" type="submit">Delete</button>
                </form>
                `;

            list.appendChild(li);
            contentInput.value = "";
        }
        catch (err) {
            console.error(err);
            alert("Sorry, there was a problem saving your comment.");
        }
    });
});