# General

- Discuss with others who did the project whether there's a way to get around the redirection to the intra page, since it means our website gets loaded twice, which can create an annoying argument about whether it's still a single-page application then

# From subject.pdf

- "You must implement some kind of server-side validation for forms and any user input."
- "When your computers in clusters run under Linux, you will use Docker in rootless mode for security reasons. This comes with 2 sideways: 1) your Docker runtime files must be located in /goinfre or /sgoinfre. 2) you can’t use so called “bind-mount volumes” between the host and the container if non-root UIDs are used in the container. Depending on the project, your situation and the context, several fallbacks exist: Docker in a VM, rebuild you container after your changes, craft your own docker image with root as unique UID."

# Before handing in

- Get rid of all redundant comments, like commented out `console.log()` lines
- Make sure that SQL injections are impossible
