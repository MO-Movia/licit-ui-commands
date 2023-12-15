export function setRuntime(runtime: any) {
    // This function is intentionally empty. It serves as a placeholder for future development.
    // Add code here as needed.
    RuntimeService.Runtime = runtime;
}

export abstract class RuntimeService {
    private static runtime: any;
    public static get Runtime() {
        return this.runtime;
    }
    public static set Runtime(runtime: any) {
        this.runtime = runtime;
    }
}