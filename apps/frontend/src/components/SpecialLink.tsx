import { router } from "../App";

/**
 * use this in the navbar
 */
export function SpecialLink({to, ...props}: { to: string } & React.ComponentPropsWithoutRef<"a">) {
    return (
        <a
            href={to}
            onClick={e => {
                e.preventDefault();
                router.navigate(to);
            }}
            {...props}
        />
    );
}
